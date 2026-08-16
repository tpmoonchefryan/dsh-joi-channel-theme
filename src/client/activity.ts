/**
 * 状态接线与其余角色位。
 *
 * 状态从 **DOM 的结构性标记** 推导，不订阅 client 侧服务。这是权衡后的选择：
 * 服务投影更"正规"，但那条路要求本插件与 ui-conversation 的投影键名耦合，
 * 而那些键名不在任何公开契约里；DOM 这边至少有 data-state 这类结构标记，
 * 失配时也只是角色不动，不会连累 app。判据一律取结构标记而非本地化文案
 * ——按"停止"两个字判断，等于把主题绑死在中文上。
 *
 * 两个角色现在共用一套词表 info/success/running/error（重出精灵表后）。
 * 分工没变，变的是视角：轴伊是本轮当事人的反应，轴芯是旁边报信的那个。
 * 原先轴伊的四段过程态里没有失败——收尾只能给 done，而那格是眨眼微笑，
 * 等于让她冲着报错笑。合并 thinking+working 腾出的那一格就是为此。
 */
import { ASSETS } from '../generated/assets.ts'
import type { ChatState, JoiState, ZhouxinState } from './chat.ts'
import { ID } from './css.ts'

/**
 * 一轮结束后结算表情停留多久（毫秒），之后回落 info。
 *
 * 5.2 秒：一轮跑完时用户的视线通常还在正文或工具输出上，短了会在他抬眼之前
 * 就散掉，等于没表演。这是 Owner 走查后从 2.6 秒翻倍的。
 */
const DONE_HOLD = 5200

/** 精灵格坐标，与 chat.ts 同表。 */
const ZHOUXIN_CELL: Record<ZhouxinState, [number, number]> = {
  info: [0, 0], success: [1, 0], running: [0, 1], error: [1, 1],
}

/**
 * 「这一轮在跑吗」的结构性判据：输入区主按钮是不是停止态。
 *
 * 停止态渲染一个圆角方块 `<rect width="10" rx="3">`，发送态渲染一条箭头 `<path>`
 * （InputBar 源码实证）。取这个形状而不是 aria-label——label 是本地化文案，
 * 按「停止」两个字判断等于把主题绑死在中文上。
 *
 * 第一版曾用 `[data-state="ongoing"]` 当运行信号，实机一轮纯文本对话打脸：
 * 那颗点只在工具卡与子代理上出现，模型单纯在流式输出时根本没有它。
 * @returns 是否有一轮正在跑。
 */
function isTurnRunning(): boolean {
  return document.querySelector('[class*=composerStack] button svg rect[width="10"][rx="3"]') !== null
}

/**
 * 从 DOM 推导轴伊「在跑」时的表情。
 *
 * 重出精灵表后 thinking 与 working 合并成 running，所以在跑期间只有一个答案；
 * 这个函数因此退化成一个存在性判断，保留它是因为返回 undefined 这层语义
 * （「这一轮不在跑」）是 StateTracker 分支的依据。
 * @returns 在跑时为 running；`undefined` 表示这一轮不在跑。
 */
export function readJoiState(): JoiState | undefined {
  if (!isTurnRunning()) return undefined
  return 'running'
}

/**
 * 数当前 DOM 里的失败标记。
 *
 * 用计数而不是「有没有」：失败的命令会永久留在记录里，问「有没有」的话，
 * 第一次失败之后每一轮都会被判成失败——实测正是如此，一轮成功的对话
 * 因为上一轮留下的两个错误标记而报了 error。
 * 开跑时记下基线，只有**增量**才算这一轮出的错。
 * @returns 失败标记数。
 */
function errorMarkCount(): number {
  return document.querySelectorAll('[data-state="error"], [role=alert]').length
}

/**
 * 两态的推导器。
 *
 * 需要跨帧记忆的有两件事：
 *   · 「刚跑完」——那一瞬间没有任何 DOM 标记可读，只能由「上一帧还在跑、
 *     这一帧不跑了」推出来。
 *   · 「这一轮跑成了还是跑砸了」——失败标记会永久留在记录里，所以要在运行期间
 *     采样、在收尾时结账，而不是每帧去问「文档里有没有 error」。
 */
export class StateTracker {
  private wasRunning = false
  private doneUntil = 0
  /** 开跑时的失败标记数。只有超过它才算这一轮出的错。 */
  private errorBaseline = 0
  /** 这一轮是否出过错。 */
  private errorSeen = false
  /** 上一轮的结果。收尾后的停留窗口里用它决定两个角色的表情。 */
  private lastFailed = false
  private now: () => number

  /**
   * @param now - 取当前时刻（毫秒）。注入是为了测试可控。
   */
  constructor(now: () => number = () => performance.now()) {
    this.now = now
  }

  /**
   * 读一次当前两态。
   * @returns 两个角色的表情。
   */
  read(): ChatState {
    const live = readJoiState()
    const t = this.now()

    if (live !== undefined) {
      if (!this.wasRunning) {
        // 这一轮刚开跑：把已有的失败标记记成基线，之后只认增量。
        this.wasRunning = true
        this.errorBaseline = errorMarkCount()
        this.errorSeen = false
      }
      this.errorSeen = this.errorSeen || errorMarkCount() > this.errorBaseline
      // 运行期两人都停在 running：出错要等收尾一起结算。
      // 之前让轴芯一探到错误就切哭脸，于是它比轴伊早换一步
      // （实测序列出现过 running/error 这一帧），两张脸对不上。
      // 结论是这一轮的结论，轮没跑完就没有结论可报。
      return { joi: live, zhouxin: 'running' }
    }

    if (this.wasRunning) {
      // 刚从「在跑」掉到「不跑」：这一瞬间结账。
      this.wasRunning = false
      this.lastFailed = this.errorSeen || errorMarkCount() > this.errorBaseline
      this.errorSeen = false
      this.doneUntil = t + DONE_HOLD
      return this.settled()
    }

    if (t < this.doneUntil) return this.settled()
    return { joi: 'info', zhouxin: 'info' }
  }

  /**
   * 收尾后停留窗口里的两态。
   *
   * 跑砸了的那一轮，轴伊回 idle 而不是 done —— done 那一格是眨眼微笑，
   * 拿它去收一次失败，等于让她冲着报错笑。四格里没有为失败准备的表情，
   * 与其挑一个语义相反的，不如什么都不表演：结论由轴芯去报，那是它的职责。
   * @returns 两个角色的表情。
   */
  private settled(): ChatState {
    return this.lastFailed
      ? { joi: 'error', zhouxin: 'error' }
      : { joi: 'success', zhouxin: 'success' }
  }
}

// ── STORY-014 反馈位 ──────────────────────────────────────────────────

/** 一处反馈位的规格：挂在哪、多大、用哪一格。 */
interface FeedbackSpot {
  /** 目标容器选择器。 */
  selector: string
  /** 角色渲染尺寸。 */
  size: number
  /** 由容器推出该用哪一格。 */
  cell: (el: Element) => ZhouxinState
}

/**
 * 三处反馈面。StateDot 不在其中——10px 太小，塞角色只会糊成一团，
 * 那是「出现频率与允许尺寸成反比」这条元素法条的触底处，纯色点即可
 * （颜色已由 token 层给到叶/绯/橘）。
 */
const SPOTS: readonly FeedbackSpot[] = [
  // Toast：按类型取格。不加动画——toast 本身已经在动。
  {
    selector: '[class*=toast]:not([data-joi-spot]), [class*=Toast]:not([data-joi-spot])',
    size: 24,
    cell: el => (/error|danger|fail/i.test(el.className) ? 'error'
      : /success|ok/i.test(el.className) ? 'success' : 'info'),
  },
  // 连接横幅：断线→伤心，重连中→打 call，已连接→开心。
  {
    selector: '[class*=banner]:not([data-joi-spot]), [class*=Banner]:not([data-joi-spot])',
    size: 28,
    cell: el => (/offline|disconnect|lost/i.test(el.className) ? 'error'
      : /reconnect|connecting/i.test(el.className) ? 'running' : 'success'),
  },
  // 审批结果条：已允许→开心；已拒绝→一般（不用伤心）。
  {
    selector: '[class*=approval]:not([data-joi-spot]), [class*=Approval]:not([data-joi-spot])',
    size: 20,
    cell: el => (/allow|approved|granted/i.test(el.className) ? 'success' : 'info'),
  },
]

/**
 * 在三处反馈面前插一个轴芯。已插过的用 data-joi-spot 标记跳过。
 * @returns 本次新插入的个数。
 */
export function paintFeedback(): number {
  let added = 0
  for (const spot of SPOTS) {
    for (const el of document.querySelectorAll(spot.selector)) {
      el.setAttribute('data-joi-spot', '1')
      const cell = ZHOUXIN_CELL[spot.cell(el)]
      const face = document.createElement('span')
      face.className = 'joi-face'
      face.style.cssText = `display:inline-block;flex:none;vertical-align:middle;margin-right:6px;`
        + `width:${spot.size}px;height:${spot.size}px;background-repeat:no-repeat;`
        + `background-image:url('${ASSETS.zhouxin}');`
        + `background-size:${spot.size * 2}px ${spot.size * 2}px;`
        + `background-position:${-cell[0] * spot.size}px ${-cell[1] * spot.size}px`
      el.prepend(face)
      added++
    }
  }
  return added
}

// ── STORY-016 子代理小鲸鱼群 ──────────────────────────────────────────

/** 小鲸鱼 1×3 精灵的格序：排队闭眼 / 运行喷水 / 完成眯眼。 */
const WHALE_CELL = { queued: 0, running: 1, done: 2 } as const

/** 单只渲染尺寸与间距。 */
const WHALE_SIZE = 20
const WHALE_GAP = 4
/** 超过就折叠成 +N —— 再多就不是「一眼数得清」了。 */
const WHALE_CAP = 6

/**
 * 把子代理计数画成一排小鲸鱼。
 *
 * 鲸是引擎，不换装：两套衣装共用同一张精灵表。
 * @returns 画了几只（0 表示当前没有子代理位）。
 */
export function paintSubagentWhales(): number {
  const slot = document.querySelector('[class*=activitySlot]')
  const trigger = slot?.parentElement
  if (slot === null || slot === undefined || trigger === undefined || trigger === null) return 0

  // 数量取自触发器上的计数文案里的数字；读不到就按「有没有 ongoing 点」算 1。
  const countText = trigger.querySelector('[class*=count]')?.textContent ?? ''
  const parsed = Number(/\d+/.exec(countText)?.[0] ?? '')
  const running = slot.querySelector('[data-state="ongoing"]') !== null
  const total = Number.isFinite(parsed) && parsed > 0 ? parsed : (running ? 1 : 0)
  if (total === 0) {
    trigger.querySelector(`#${ID}-whales`)?.remove()
    return 0
  }

  let strip = trigger.querySelector<HTMLElement>(`#${ID}-whales`)
  if (strip === null) {
    strip = document.createElement('span')
    strip.id = `${ID}-whales`
    strip.style.cssText = `display:inline-flex;align-items:flex-end;gap:${WHALE_GAP}px;`
      + 'flex:none;margin-right:6px'
    // 原生那颗 10px 活动点让位给鲸群，但不删——插件卸载时要还回去。
    ;(slot as HTMLElement).style.display = 'none'
    slot.after(strip)
  }

  const shown = Math.min(total, WHALE_CAP)
  const cell = running ? WHALE_CELL.running : WHALE_CELL.done
  strip.replaceChildren()
  for (let i = 0; i < shown; i++) {
    const whale = document.createElement('span')
    // 三格底缘 610/610/612（实测），按底对齐排一行。
    whale.style.cssText = `display:block;width:${WHALE_SIZE}px;height:${WHALE_SIZE}px;`
      + `background-image:url('${ASSETS.subWhales}');background-repeat:no-repeat;`
      + `background-size:${WHALE_SIZE * 3}px ${WHALE_SIZE}px;`
      + `background-position:${-cell * WHALE_SIZE}px 0`
    strip.append(whale)
  }
  if (total > WHALE_CAP) {
    const more = document.createElement('span')
    more.textContent = `+${total - WHALE_CAP}`
    more.style.cssText = 'font-size:11px;color:var(--dsw-alias-label-tertiary);line-height:1'
    strip.append(more)
  }
  return shown
}

/** 还原被鲸群顶替的原生活动点。 */
export function unpaintSubagentWhales(): void {
  for (const strip of document.querySelectorAll(`#${ID}-whales`)) {
    const slot = strip.previousElementSibling
    if (slot instanceof HTMLElement) slot.style.removeProperty('display')
    strip.remove()
  }
}

// ── STORY-017 首次引导角色位 ──────────────────────────────────────────

/**
 * 引导里的角色位。
 *
 * 首屏放鲸鱼娘站姿；**输入 API Key 那一步刻意不放角色**——
 * 用户输入凭据时不该被注视，留白在这里就是设计。
 * @returns 是否画了。
 */
export function paintOnboarding(): boolean {
  const notice = document.querySelector('[class*=welcomeNotice], [class*=WelcomeNotice]')
  if (notice === null) return false
  if (notice.querySelector(`#${ID}-guide`) !== null) return true
  // 有输入框 = 到了填凭据那一步，撤掉角色。
  if (notice.querySelector('input') !== null) return false

  const whale = document.createElement('img')
  whale.id = `${ID}-guide`
  whale.src = ASSETS.whaleStand
  whale.alt = 'Deepseek 鲸鱼娘'
  whale.style.cssText = 'width:160px;height:auto;display:block;margin:0 auto 8px'
  notice.prepend(whale)
  return true
}

/** 移除引导角色位。 */
export function unpaintOnboarding(): void {
  document.getElementById(`${ID}-guide`)?.remove()
  for (const face of document.querySelectorAll('.joi-face')) face.remove()
  for (const el of document.querySelectorAll('[data-joi-spot]')) el.removeAttribute('data-joi-spot')
}
