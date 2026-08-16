/**
 * 对话页的两个 Q 版角色，以及压在它们上面的文字如何保持可读。
 *
 * 落座定稿（Owner 三轮现场纠偏）：正立、无倾斜、坐在输入框上方，
 * 底缘与框顶平齐，左轴芯右轴伊。
 *
 * 「底缘平齐」不能按元素底对齐 —— 元素对齐 ≠ 视觉对齐。三张精灵表的内容
 * 底缘在格子里的位置不同（轴伊压到 0.995，轴芯 traced 版是 0.957），
 * 直接对元素底会差出约 5px，一高一低看得很明显。所以按各表实测的
 * 「内容底缘占格高比例」换算。
 *
 * 三张表都是 2×2 精灵图，直接当精灵用不切片：格内一致性实测极好
 * （头顶极差 0.6%/0.3%），按 112px 渲染最大偏移 1.7px。
 */
import { ASSETS } from '../generated/assets.ts'
import { SELECTORS, HALO_CLASS } from './css.ts'
import { intersects } from './dom.ts'
import type { Suit } from '../generated/baseline.ts'

/**
 * 两个角色共用一套状态词表。
 *
 * 原先轴伊是四段过程态（idle/thinking/working/done），里面没有失败——
 * 一轮跑砸了只能给 done，而那一格是眨眼微笑，等于让她冲着报错笑。
 * 重出的四格改为与轴芯同一套：thinking 与 working 合并成 running，
 * 空出来的那格给 error。代价是失去「在想」与「在跑工具」的区分，
 * 换来失败时有表情可用；这是 Owner 的取舍，记在 design/joi-sprite-respec.md。
 */
export type FaceState = 'info' | 'success' | 'running' | 'error'

/** 轴伊的表情态。 */
export type JoiState = FaceState

/** 轴芯的表情态。 */
export type ZhouxinState = FaceState

/** 精灵格坐标（列, 行）。两张表同布局，一份映射通吃。 */
const CELL: Record<FaceState, [number, number]> = {
  info: [0, 0], success: [1, 0], running: [0, 1], error: [1, 1],
}

/**
 * 各表「内容底缘」占格高的比例（PIL 实测）。traced 版四格极差 0.000，
 * 轴伊两表极差 ≤0.010，所以每张表一个值即可，不必逐格补。
 */
const FOOT = { joi: 0.995, zhouxin: 0.957 } as const

/** 角色渲染尺寸与左右内缩。 */
const SIZE = 112
const INSET = 28

/** 对话页角色要用到的节点。 */
export interface ChatNodes {
  /** 轴伊 · 过程态 · 卡片右侧。 */
  joi: HTMLElement
  /** 轴芯 · 结论态 · 卡片左侧。 */
  zhouxin: HTMLElement
}

/** 两个角色当前的表情。 */
export interface ChatState {
  /** 轴伊过程态。 */
  joi: JoiState
  /** 轴芯结论态。 */
  zhouxin: ZhouxinState
}

/**
 * 取对话页的 composer（没有 composerHero 修饰类的那个）。
 * @returns 对话版 composerStack 或 null。
 */
function chatComposer(): Element | null {
  const stack = document.querySelector(SELECTORS.composerStack)
  if (stack === null) return null
  return /composerHero/.test(stack.className) ? null : stack
}

/**
 * 取输入区那张可见卡片。
 *
 * 锚点必须是卡片而不是 composerStack：容器是满宽的（1232px），
 * 卡片只有 780px 且水平居中，锚错会把角色甩到输入框外侧约 226px 的空白区。
 * @returns 卡片元素或 null。
 */
function visibleCard(): Element | null {
  return chatComposer()?.querySelector(SELECTORS.composerCard) ?? null
}

/**
 * 摆放两个 Q 版角色。不在对话页就整组隐藏。
 * @param nodes - 角色节点。
 * @param suit - 当前衣装。
 * @param state - 两个角色的表情。
 * @returns 量测读数，未摆放时 undefined。
 */
export function placeChat(nodes: ChatNodes, suit: Suit, state: ChatState): ChatMetrics | undefined {
  const card = visibleCard()
  const r = card?.getBoundingClientRect()
  if (r === undefined || r.width === 0) {
    nodes.joi.style.display = 'none'
    nodes.zhouxin.style.display = 'none'
    return undefined
  }

  const seat = r.top // 落座线 = 输入框顶边
  const joiSheet = suit === 'flowers' ? ASSETS.joiFlowers : ASSETS.joiLibrary

  seatOne(nodes.joi, joiSheet, CELL[state.joi], r.right - INSET - SIZE, seat - SIZE * FOOT.joi)
  seatOne(nodes.zhouxin, ASSETS.zhouxin, CELL[state.zhouxin], r.left + INSET, seat - SIZE * FOOT.zhouxin)

  return {
    seat: Math.round(seat),
    joiFootDelta: Math.round(nodes.joi.getBoundingClientRect().top + SIZE * FOOT.joi - seat),
    zhouxinFootDelta: Math.round(nodes.zhouxin.getBoundingClientRect().top + SIZE * FOOT.zhouxin - seat),
  }
}

/** 一次落座的量测读数。两个 footDelta 都应为 0。 */
export interface ChatMetrics {
  /** 落座线（输入框顶边）的视口 y。 */
  seat: number
  /** 轴伊内容底缘与落座线的差。 */
  joiFootDelta: number
  /** 轴芯内容底缘与落座线的差。 */
  zhouxinFootDelta: number
}

/**
 * 把一个角色放到指定位置并切到指定精灵格。
 * @param el - 角色节点。
 * @param sheet - 精灵表 data URI。
 * @param cell - 精灵格坐标。
 * @param left - 视口 x（写入时转文档坐标——节点是 absolute，与内容同层）。
 * @param top - 视口 y（同上）。
 */
function seatOne(el: HTMLElement, sheet: string, cell: [number, number], left: number, top: number): void {
  el.style.display = 'block'
  el.style.width = `${SIZE}px`
  el.style.height = `${SIZE}px`
  el.style.backgroundImage = `url('${sheet}')`
  el.style.backgroundSize = `${SIZE * 2}px ${SIZE * 2}px`
  el.style.backgroundPosition = `${-cell[0] * SIZE}px ${-cell[1] * SIZE}px`
  el.style.left = `${Math.round(left + window.scrollX)}px`
  el.style.top = `${Math.round(top + window.scrollY)}px`
}

/**
 * 自动可读性：只给与角色矩形相交的文字块加描边，其余文字保持原样。
 *
 * 纯 CSS 做不到这一点——它无法知道一段文字背后有没有东西。所以由 JS 做
 * 相交判定再打类。长对话滚动时角色不动、文字动，所以每帧都要重判。
 * @param nodes - 角色节点。
 */
export function applyHalo(nodes: ChatNodes): void {
  const boxes = [nodes.joi, nodes.zhouxin]
    .filter(el => el.style.display !== 'none')
    .map(el => el.getBoundingClientRect())
  // Think 块与工具行的文字在 span[hash]_summary 里，不含 markdown/bubble 任何子串，
  // 所以前四项够不着它们。[data-disclosure-row] 是 DisclosureRow 给 Think 行、
  // 每个 ToolRow、GenericCommandCard、ContextInjectionRow 统一打的未哈希钩子，
  // 一项覆盖全部；该行 CSS 固定 height:24px;overflow:hidden;display:flex，
  // 结构上不可能退化成大容器，不存在「整片文字被描边」的过度命中。
  // bubble 两项必须限定 div：Tooltip 自己的局部类也叫 .bubble（哈希后仍含该子串）。
  // 不限定就会把 halo 打到 span[role=tooltip] 上——而 halo 一旦带 position，
  // 就会把 position:fixed 的提示条拽进普通流，引起布局位移、锚点移动、
  // 于是 hover 反复进出，表现为提示条高速频闪。CSS 那边的同名规则已限定，
  // 这份 JS 候选集当时漏了。
  const blocks = document.querySelectorAll<HTMLElement>(
    '[class*=markdown] p, [class*=Markdown] p, div[class*=bubble], div[class*=Bubble],'
    + `${SELECTORS.disclosureRow}`,
  )
  for (const block of blocks) {
    const r = block.getBoundingClientRect()
    block.classList.toggle(HALO_CLASS, boxes.some(b => intersects(r, b)))
  }
}
