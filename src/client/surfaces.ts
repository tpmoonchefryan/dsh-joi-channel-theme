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
import { HALO_CLASS, ID, TEX_CLASS, stylesheet } from './css.ts'
import { OwnedNodes, framed } from './dom.ts'
import { brandSurgery, placeHero, undoBrandSurgery, type HeroMetrics, type HeroNodes } from './hero.ts'
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
}

/** 装饰层。 */
export class Surfaces {
  private readonly nodes = new OwnedNodes()
  /** 量测读数的落点。挂在自己的 style 节点上，不污染 app 的任何元素。 */
  private readonly stamp: HTMLStyleElement
  private readonly hero: HeroNodes
  private readonly chat: ChatNodes
  private readonly loop: { schedule: () => void, dispose: () => void }
  private readonly observer: MutationObserver
  private suit: Suit
  private state: ChatState = { joi: 'info', zhouxin: 'info' }
  /** 过程态要跨帧记忆才能认出「刚跑完」。 */
  private readonly tracker = new StateTracker()
  /** 手动置态（调试/演示）后暂停自动推导，避免下一帧被覆盖回去。 */
  private manual = false
  private textured = 0
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
    tagline.style.cssText = 'position:fixed;pointer-events:none;text-align:center;'
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
      }))
      return
    }
    // 从原生切回来时把样式表接回去。
    if (this.stamp.sheet !== null) this.stamp.sheet.disabled = false
    // 字标手术每帧重试而不是一次性闩住：React 可能重渲染字标，
    // 从原生切回衣装时也要重做。函数自身用 data-joi-done 做幂等。
    const branded = brandSurgery()
    // 表情跟着真实运行状态走；手动置态时让位给人。
    if (!this.manual) this.state = this.tracker.read()
    this.textured = paintTexture()
    const hero = placeHero(this.hero, this.suit)
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
