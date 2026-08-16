/**
 * 装饰层的调度中枢：持有全部浮层节点，在需要时重算一次布局。
 *
 * 为什么是一个循环而不是每个部件各管各的：hero 与对话页共用同一个
 * composerStack 判别式，底纹与品牌区手术也都要等 React 渲染完；分成几个
 * observer 各跑各的，等于把同一件事算好几遍，滚动时会明显发涩。
 *
 * 整个模块的失败姿态是 fail-soft：选择器失配、素材缺失、量测拿到 0 宽——
 * 一律隐藏对应装饰，绝不抛给 app。装饰不出现是可接受的降级，
 * 把原生界面弄坏不是。
 */
import { HALO_CLASS, ID, SELECTORS, TEX_CLASS, stylesheet } from './css.ts'
import { OwnedNodes, framed } from './dom.ts'
import {
  brandSurgery, heroComposer, placeHero, trackHero, undoBrandSurgery,
  type HeroMetrics, type HeroNodes,
} from './hero.ts'
import { applyHalo, placeChat, type ChatMetrics, type ChatNodes, type ChatState } from './chat.ts'
import { paintMeter, unpaintMeter } from './meter.ts'
import {
  StateTracker, paintFeedback, paintOnboarding, paintSubagentWhales,
  unpaintOnboarding, unpaintSubagentWhales,
} from './activity.ts'
import { ASSETS } from '../generated/assets.ts'
import type { Suit } from '../generated/baseline.ts'

/** 调试与回归断言读的量测快照。 */
export interface Metrics {
  /** 当前衣装。 */
  suit: Suit
  /** app 是否处于深色（只读，插件从不写这个属性）。 */
  dark: boolean
  /** 新会话页读数；不在该页时 undefined。 */
  hero: HeroMetrics | undefined
  /** 对话页读数；不在该页时 undefined。 */
  chat: ChatMetrics | undefined
  /** 贴上底纹的表面数。 */
  texturedSurfaces: number
  /** 字标手术是否已完成。 */
  branded: boolean
  /** 上下文占用率（橘子成熟度所指）；无该控件时 undefined。 */
  contextPercent: number | undefined
  /** 衣装偏好持久化通道的实况。 */
  persistence: unknown
  /** 两个角色当前的表情。 */
  state: ChatState
  /** 本帧新接管的反馈位个数。 */
  feedbackSpots: number
  /** 画出的子代理小鲸鱼只数。 */
  subagentWhales: number
  /** 引导角色位是否在场。 */
  onboarding: boolean
  /** 当前皮肤（含 native）。 */
  skin: string
  /** 此刻本该命中却落空的选择器名；空数组表示 app 的类名与本插件仍然对得上。 */
  selectorMisses: string[]
}

/** 落空持续多久才判定为改版失配。窄视口与首帧渲染造成的瞬时落空远短于此。 */
const MISS_GRACE = 3000

/**
 * 选择器自检：只查此刻**必然存在**的那几条，落空即记名。
 *
 * fail-soft 要留，但不能连痕迹都不留。宿主升到 rc.6 时四条带 hash 的选择器
 * 同时失配，而"装饰不出现"和"根本没进那个页面"从外面看一模一样，
 * 于是这事一直无声地拖到用户报障。这里把它变成一句可搜的告警。
 *
 * 只查与页面无关的常驻锚点；hero 两条则在确实进了新会话页时才算数，
 * 否则"对话页上没有大标题"会被误报成失配。
 * @returns 落空的选择器名。
 */
function selectorMisses(): string[] {
  const miss: string[] = []
  const need = (name: keyof typeof SELECTORS): void => {
    if (document.querySelector(SELECTORS[name]) === null) miss.push(name)
  }
  for (const name of ['logoRow', 'sidebarCol', 'composerStack', 'composerSend'] as const) {
    need(name)
  }
  // 品牌区只在侧栏展开时存在——收起时 app 压根不渲染它，无条件要求它会把
  // 「用户收起了侧栏」误报成改版失配。判据用 app 自己标的 data 位，不要用
  // 容器宽度：窄视口自动收起与手动收起是两种状态，后者的 logoRow 仍是满宽。
  if (document.querySelector(SELECTORS.sidebarCollapsed) === null) need('brand')
  if (heroComposer() !== null) {
    need('headline')
    need('heroStack')
  }
  return miss
}

/** 装饰层。 */
export class Surfaces {
  private readonly nodes = new OwnedNodes()
  /** 量测读数的落点。挂在自己的 style 节点上，不污染 app 的任何元素。 */
  private readonly stamp: HTMLStyleElement
  private readonly hero: HeroNodes
  private readonly chat: ChatNodes
  private readonly loop: { schedule: () => void, dispose: () => void }
  /**
   * 逐帧贴锚的 rAF 句柄；undefined 表示没在跑。
   *
   * 为什么是逐帧而不是监听事件：坐标只在算的那一刻成立，而让浮层与锚点错位的
   * 原因有一大把——内层容器滚动、CSS 过渡、transform、相邻元素的布局变化。
   * 逐个去接事件源必定漏（先接了 MutationObserver + resize 漏掉滚动，补了
   * scroll 又漏掉不产生滚动事件的那些）。锚定本就是一个视觉关系，逐帧维持它
   * 才是对的量级。只在新会话页跑，且值没变就不写样式。
   * 文档层的滚动与橡皮筋回弹不经这里：浮层是 absolute、与内容同层，合成器
   * 直接带着走（回弹那次平移 JS 根本读不到，也只有同层这一条路能跟上）。
   */
  private follow: number | undefined
  private readonly observer: MutationObserver
  private suit: Suit
  private state: ChatState = { joi: 'info', zhouxin: 'info' }
  /** 过程态要跨帧记忆才能认出「刚跑完」。 */
  private readonly tracker = new StateTracker()
  /** 手动置态（调试/演示）后暂停自动推导，避免下一帧被覆盖回去。 */
  private manual = false
  private textured = 0
  /** 最近一次自检的落空名单。 */
  private misses: string[] = []
  /**
   * 落空是从何时开始连续出现的；null 表示当前没有落空。
   *
   * 不能一查到就报警，也不能查一次就闩住：窄视口下 app 压根不渲染品牌区，
   * React 首帧也常常什么都还没挂上，两者都会造成瞬时落空。真正的改版失配
   * 是**持续**的，所以按时长定性。
   */
  private missSince: number | null = null
  /** 告警只发一次，不在每帧刷屏。 */
  private warned = false
  /**
   * 是否处于原生态。为真时装饰层静默：不画、不改 DOM，只如实上报。
   * 这不是 dispose——切回衣装要能原地恢复，所以监听与节点都留着。
   */
  private native = false

  /**
   * @param suit - 初始衣装。
   */
  private readonly probe: () => unknown

  /**
   * @param suit - 初始衣装。
   * @param probe - 额外读数提供者（持久化通道实况）。
   */
  constructor(skin: Suit | 'native', probe: () => unknown = () => undefined) {
    this.native = skin === 'native'
    this.suit = skin === 'native' ? 'flowers' : skin
    this.probe = probe
    this.stamp = this.nodes.style(`${ID}-css`, stylesheet())

    const portrait = this.nodes.own('img', `${ID}-portrait`)
    portrait.alt = '轴伊 Joi 立绘'
    const whale = this.nodes.own('img', `${ID}-whale`)
    whale.alt = 'Deepseek 鲸鱼娘'
    whale.src = ASSETS.whaleLay
    const tagline = this.nodes.own('div', `${ID}-tagline`)
    // absolute 而非 fixed：标语锚在输入卡片上，要与内容同层（见 overlayRules 的说明）。
    tagline.style.cssText = 'position:absolute;pointer-events:none;text-align:center;'
      + 'font-size:12px;color:var(--dsw-alias-label-tertiary);z-index:6'
    this.hero = { portrait, whale, tagline }

    this.chat = {
      joi: this.nodes.own('div', `${ID}-joi`),
      zhouxin: this.nodes.own('div', `${ID}-zhouxin`),
    }

    this.loop = framed(() => { this.reconcile() })

    // React 每次重渲染都可能换掉标题/卡片/字标节点，presenter 切明暗时也会
    // 动 body 属性。两者都要重算，所以订阅整棵 body 的子树变化。
    this.observer = new MutationObserver(() => { this.loop.schedule() })
    this.observer.observe(document.body, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-ds-dark-theme'],
    })
    window.addEventListener('resize', this.loop.schedule)
    portrait.addEventListener('load', this.loop.schedule)
    this.loop.schedule()
  }

  /**
   * 换装。只改素材与量测，token 层由 SuitRuntime 负责。
   * @param suit - 新衣装。
   */
  setSuit(skin: Suit | 'native'): void {
    this.native = skin === 'native'
    if (skin !== 'native') this.suit = skin
    this.loop.schedule()
  }

  /**
   * 改两个角色的表情。
   * @param patch - 要改的部分。
   */
  setState(patch: Partial<ChatState>): void {
    this.manual = true
    this.state = { ...this.state, ...patch }
    this.loop.schedule()
  }

  /**
   * @returns 最近一次 reconcile 的量测快照（没有则现算一次）。
   *          不在这里重跑布局：重跑会写 DOM，而读数不该有副作用。
   */
  metrics(): Metrics {
    const raw = this.stamp.getAttribute('data-joi-metrics')
    if (raw !== null) return JSON.parse(raw) as Metrics
    this.reconcile()
    return JSON.parse(this.stamp.getAttribute('data-joi-metrics') ?? '{}') as Metrics
  }

  /** 拆掉装饰层。 */
  dispose(): void {
    this.observer.disconnect()
    window.removeEventListener('resize', this.loop.schedule)
    this.loop.dispose()
    this.stopFollow()
    this.quiesce()
    this.nodes.dispose()
  }

  /**
   * 切到原生态：撤掉一切装饰，但保留节点与监听以便原地切回。
   *
   * 与 dispose 的区别只在监听：dispose 会解绑 resize 并销毁节点，
   * quiesce 不会——切回衣装时靠的正是那个监听把布局重新算起来。
   */
  private quiesce(): void {
    // 原生态下浮层全隐，逐帧贴锚没有意义，先停掉。
    this.stopFollow()
    // 关键一步：停掉整张样式表。
    // 只撤装饰是不够的——结构类规则（品牌区 98px 左内边距、logoRow 撑到 74px、
    // 侧栏竖条、药丸 tab、composer 层序）还在生效，原生态就成了"没有装饰的错位界面"。
    // 用 sheet.disabled 而不是清空文本：元素还在，量测属性也就还在。
    if (this.stamp.sheet !== null) this.stamp.sheet.disabled = true
    for (const el of [this.hero.portrait, this.hero.whale, this.hero.tagline,
                      this.chat.joi, this.chat.zhouxin]) {
      el.style.display = 'none'
    }
    for (const el of document.querySelectorAll(`.${TEX_CLASS}`)) el.classList.remove(TEX_CLASS)
    for (const el of document.querySelectorAll(`.${HALO_CLASS}`)) el.classList.remove(HALO_CLASS)
    unpaintMeter()
    unpaintSubagentWhales()
    unpaintOnboarding()
    undoBrandSurgery()
    this.textured = 0
  }

  /** 开始逐帧贴锚。已在跑则什么都不做。 */
  private startFollow(): void {
    if (this.follow !== undefined) return
    const step = (): void => {
      this.follow = requestAnimationFrame(step)
      trackHero(this.hero)
    }
    this.follow = requestAnimationFrame(step)
  }

  /** 停止逐帧贴锚。离开新会话页、进原生态、拆装饰层时都要停。 */
  private stopFollow(): void {
    if (this.follow === undefined) return
    cancelAnimationFrame(this.follow)
    this.follow = undefined
  }

  /** 重算一次。由 framed 合并到下一帧调用。 */
  private reconcile(): void {
    if (this.native) {
      this.quiesce()
      // 量测照常上报：原生态也要能被回归脚本看见，不能变成读不到的黑箱。
      this.stamp.setAttribute('data-joi-metrics', JSON.stringify({
        suit: this.suit, skin: 'native',
        dark: document.body.hasAttribute('data-ds-dark-theme'),
        hero: undefined, chat: undefined, texturedSurfaces: 0, branded: false,
        contextPercent: undefined, persistence: this.probe(),
        state: this.state, feedbackSpots: 0, subagentWhales: 0, onboarding: false,
        selectorMisses: this.misses,
      }))
      return
    }
    // 从原生切回来时把样式表接回去。
    if (this.stamp.sheet !== null) this.stamp.sheet.disabled = false
    // 字标手术每帧重试而不是一次性闩住：React 可能重渲染字标，
    // 从原生切回衣装时也要重做。函数自身用 data-joi-done 做幂等。
    const branded = brandSurgery()
    // 等 app 真渲染出来再自检。composerCard 是 app 自带的 data 钩子，不随类名
    // 改版走，拿它当「界面已就位」的判据最稳；代价是它自己失配时这套自检不会
    // 启动，但那种程度的改版会以远比装饰缺失更响的方式暴露出来。
    if (document.querySelector(SELECTORS.composerCard) !== null) {
      this.misses = selectorMisses()
      if (this.misses.length === 0) {
        this.missSince = null
      } else {
        this.missSince ??= Date.now()
        if (!this.warned && Date.now() - this.missSince > MISS_GRACE) {
          this.warned = true
          console.warn(
            `[joi-theme] 选择器持续失配：${this.misses.join('、')}。`
            + 'DeepSeek Harness 的类名很可能已改版，对应装饰不会出现——请升级本插件或提 issue。',
          )
        }
      }
    }
    // 表情跟着真实运行状态走；手动置态时让位给人。
    if (!this.manual) this.state = this.tracker.read()
    this.textured = paintTexture()
    const hero = placeHero(this.hero, this.suit)
    if (hero === undefined) this.stopFollow()
    else this.startFollow()
    const chat = placeChat(this.chat, this.suit, this.state)
    applyHalo(this.chat)
    const contextPercent = paintMeter()
    const feedbackSpots = paintFeedback()
    const subagentWhales = paintSubagentWhales()
    const onboarding = paintOnboarding()

    // 量测同时落到 DOM 属性上。window.__joi 只在页面自身的 JS 世界里可见，
    // 而自动化取证（浏览器扩展、Playwright 的隔离世界）读不到页面全局，
    // 只读得到 DOM——回归脚本因此走这条。
    this.stamp.setAttribute('data-joi-metrics', JSON.stringify({
      suit: this.suit,
      dark: document.body.hasAttribute('data-ds-dark-theme'),
      hero, chat, texturedSurfaces: this.textured, branded, contextPercent,
      persistence: this.probe(),
      state: this.state, feedbackSpots, subagentWhales, onboarding, skin: this.suit,
      selectorMisses: this.misses,
    }))
  }
}

/**
 * 找出真正画着底色的大容器，给它们贴底纹。
 *
 * 纹理不能贴 body：AppFrame 与 ConversationRoot 都把 --dsw-alias-bg-base
 * 画成不透明底色压在上面，body 的图案永远看不见。正式的解法应该是 app 侧
 * 出一个 --dsh-bg-texture 由这些组件消费（upstream 议题，不在本 INIT 范围），
 * 在那之前只能运行期认领。
 *
 * 判据是「尺寸接近视口 且 背景色恰好等于 body 底色」——面板、卡片、弹层的
 * 底色都不是 bg-base，所以不会被误伤，纹理也就不会透进面板。
 * @returns 贴上底纹的表面数。
 */
function paintTexture(): number {
  const base = getComputedStyle(document.body).backgroundColor
  let hit = 0
  for (const el of document.querySelectorAll('body div')) {
    if (hit >= 8) break
    const r = el.getBoundingClientRect()
    if (r.width < window.innerWidth * 0.45 || r.height < window.innerHeight * 0.45) continue
    if (getComputedStyle(el).backgroundColor !== base) continue
    el.classList.add(TEX_CLASS)
    hit++
  }
  return hit
}
