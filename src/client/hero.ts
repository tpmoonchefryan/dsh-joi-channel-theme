/**
 * 新会话页的组合：立绘、鲸鱼娘、品牌区、衣装标语。
 *
 * 几何全部来自 design/baseline-4q.json 的 geometry 段（构建期生成进
 * ../generated/baseline.ts），不在这里手抄——手抄的下场是基线改了代码不知道。
 *
 * 立绘只属于新会话 layout。判别式是 composerStack 上的 composerHero 修饰类：
 *   新会话  composerStack + composerHero   居中偏上
 *   对话    composerStack                  贴底满宽
 * 立绘是场所身份（入口出现一次），Q 版是 agent 状态（活在对话过程里），
 * 各绑各的 layout，天然互斥。
 */
import { GEOMETRY, type Suit } from '../generated/baseline.ts'
import { ASSETS } from '../generated/assets.ts'
import { SELECTORS } from './css.ts'

/** 立绘画幅高宽比。 */
const ASPECT = GEOMETRY.portrait.canvas[1] / GEOMETRY.portrait.canvas[0]

/** 衣装标语。落在输入栏上方，只在空会话页出现。 */
const TAGLINE: Record<Suit, string> = {
  flowers: '幸せにできる魔法があればよかった',
  library: 'MENTAL IMAGINE LIBRARY · 溶雪的时刻',
}

/** hero 一次布局要用到的节点。 */
export interface HeroNodes {
  /** 立绘。 */
  portrait: HTMLImageElement
  /** 趴姿鲸鱼娘。 */
  whale: HTMLImageElement
  /** 衣装标语。 */
  tagline: HTMLElement
}

/**
 * 取新会话页的 composer（带 composerHero 修饰类的那个），不是就返回 null。
 * @returns hero 版 composerStack 或 null。
 */
export function heroComposer(): Element | null {
  const stack = document.querySelector(SELECTORS.composerStack)
  if (stack === null) return null
  return /composerHero/.test(stack.className) ? stack : null
}

/**
 * 摆放 hero 的三件套。不在新会话页就整组隐藏。
 * @param nodes - hero 节点。
 * @param suit - 当前衣装。
 * @returns 实际摆放了则为量测读数，否则 undefined。
 */
export function placeHero(nodes: HeroNodes, suit: Suit): HeroMetrics | undefined {
  const anchor = headlineAnchor()
  if (anchor === null) {
    hide(nodes)
    return undefined
  }
  const { headline, tr } = anchor

  for (const el of [nodes.portrait, nodes.whale, nodes.tagline]) el.style.display = 'block'

  // ── 立绘：把金瞳锚到「距右缘 168px × 标题文字中线」这一点。
  // eyeY 必须运行时量：hero 区垂直居中，随视口高度浮动，写死就会在别的
  // 视口高度上错位。eyeX 按距右缘定义，窗口变宽也稳。
  //
  // 量的是「未滚动时」的标题中线：把当前滚动量加回去。立绘是视口上的场所
  // 身份，不随内容滚（与鲸鱼娘、标语相反）；不加这一笔，滚动之后任意一次
  // 重算都会拿滚过的矩形把她一起拖下去。滚动量为 0 时该式与原式等值，
  // 四象限基线读数因此不变。
  const g = GEOMETRY.portrait
  const eye = g.eyeAnchor[suit]
  const eyeY = tr.y + tr.height / 2 + scrolledBy()
  const eyeX = window.innerWidth - g.eyeRight
  const w = g.width
  nodes.portrait.src = suit === 'flowers' ? ASSETS.portraitFlowers : ASSETS.portraitLibrary
  nodes.portrait.style.width = `${w}px`
  nodes.portrait.style.left = `${eyeX - w * eye[0]}px`
  nodes.portrait.style.top = `${eyeY - w * ASPECT * eye[1]}px`
  nodes.portrait.style.webkitMaskImage = g.mask
  nodes.portrait.style.maskImage = g.mask

  const whale = placeWhale(nodes, headline, tr)
  nodes.tagline.textContent = TAGLINE[suit]
  placeTagline(nodes)

  return {
    eye: { x: Math.round(eyeX), y: Math.round(eyeY) },
    portraitBottom: Math.round(eyeY - w * ASPECT * eye[1] + w * ASPECT),
    clawOverlap: whale.clawOverlap,
    whaleCenterOffset: whale.centerOffset,
    viewport: [window.innerWidth, window.innerHeight],
  }
}

/**
 * 当前内容已经滚过的距离。
 *
 * hero 滚的是 app 的会话滚动体而不是窗口，所以两处都要算上：某些窗口尺寸下
 * 文档本身也会出现滚动条。
 * @returns 纵向滚动量（px）。
 */
function scrolledBy(): number {
  const thread = document.querySelector(SELECTORS.thread)
  return (thread?.scrollTop ?? 0) + window.scrollY
}

/**
 * 取标题行与其文字 span 的当前位置。不在新会话页、或标题还没渲染出来时为 null。
 * @returns 标题元素与文字 span 的视口矩形。
 */
function headlineAnchor(): { headline: Element, tr: DOMRect } | null {
  const headline = heroComposer() === null ? null : document.querySelector(SELECTORS.headline)
  if (headline === null) return null
  // 标题里的文字 span —— 要排除原生小鲸鱼的热区，它也是 headline 的子 span。
  const text = headline.querySelector(`span:not(${SELECTORS.fishHitbox})`)
  if (text === null) return null
  return { headline, tr: text.getBoundingClientRect() }
}

/**
 * 摆放鲸鱼娘：横向对齐「小鲸鱼 + 标题」的合并跨度，而不是只对齐文字——
 * 预览版徽章是上标小药丸，不计入视觉重心。
 * @param nodes - hero 节点。
 * @param headline - 标题行。
 * @param tr - 标题文字 span 的视口矩形。
 * @returns 压入量与居中偏差，供量测读数使用。
 */
function placeWhale(nodes: HeroNodes, headline: Element, tr: DOMRect): {
  clawOverlap: number, centerOffset: number,
} {
  const wm = GEOMETRY.whaleMusume
  const fish = headline.querySelector(SELECTORS.fishHitbox)
  const fr = fish?.getBoundingClientRect()
  const spanLeft = fr !== undefined && fr.width > 0 ? Math.min(fr.left, tr.left) : tr.left
  const cx = (spanLeft + tr.right) / 2
  set(nodes.whale, 'width', `${wm.width}px`)
  set(nodes.whale, 'left', `${Math.round(cx - wm.width / 2)}px`)
  // 爪尖落点 = 字顶 + 宽 × (clawLine − anchor)。anchor 小于 clawLine 才产生压入；
  // 反过来会把她抬到标题上方去，读成悬浮。
  set(nodes.whale, 'top', `${Math.round(tr.top - wm.width * wm.anchor)}px`)
  return {
    clawOverlap: Math.round(wm.width * (wm.clawLine - wm.anchor)),
    centerOffset: Math.round(cx - (spanLeft + tr.right) / 2),
  }
}

/**
 * 摆放衣装标语：输入卡片上方一行小字。
 *
 * 锚点必须是卡片而不是 composerStack：hero 版的 stack 把标题也包在里面，
 * 贴它的上沿会把标语甩到标题上方去、正落在鲸鱼娘身下。
 * @param nodes - hero 节点。
 */
function placeTagline(nodes: HeroNodes): void {
  const card = heroComposer()?.querySelector(SELECTORS.composerCard)
  const cr = card?.getBoundingClientRect()
  if (cr === undefined) {
    nodes.tagline.style.display = 'none'
    return
  }
  set(nodes.tagline, 'left', `${Math.round(cr.left)}px`)
  set(nodes.tagline, 'width', `${Math.round(cr.width)}px`)
  set(nodes.tagline, 'top', `${Math.round(cr.top - 24)}px`)
  set(nodes.tagline, 'display', 'block')
}

/**
 * 写样式，值没变就不写。
 *
 * 贴锚是逐帧跑的，无脑赋值等于每帧都让这几个节点的样式失效一次；
 * 而绝大多数帧里画面根本没动。
 * @param el - 目标节点。
 * @param prop - 样式属性名。
 * @param value - 目标值。
 */
function set(el: HTMLElement, prop: 'width' | 'left' | 'top' | 'display', value: string): void {
  if (el.style[prop] !== value) el.style[prop] = value
}

/**
 * 滚动时重新贴锚。
 *
 * 三件套都是 position:fixed，坐标取自 getBoundingClientRect——只在算的那一刻
 * 成立。而滚动既不产生 DOM 变更也不触发 resize，两条既有触发路都收不到，
 * 于是内容滚走了、浮层还钉在原处。这条轻量路专门补这个缺口。
 *
 * 只重贴鲸鱼娘（跟标题）与标语（跟输入卡片）。**立绘不动**：它是视口上的场所
 * 身份，不随内容滚，这是设计意图而不是遗漏。也正因为它不参与，这里不能直接
 * 复用 placeHero——那会把立绘一起挪走。
 * @param nodes - hero 节点。
 */
export function trackHero(nodes: HeroNodes): void {
  // 没摆出来就没什么可跟的（对话页、或还没渲染完）。
  if (nodes.whale.style.display === 'none') return
  const anchor = headlineAnchor()
  if (anchor === null) return
  placeWhale(nodes, anchor.headline, anchor.tr)
  placeTagline(nodes)
}

/** 一次 hero 布局的量测读数，供回归断言与调试读取。 */
export interface HeroMetrics {
  /** 金瞳落点。 */
  eye: { x: number, y: number }
  /** 立绘底缘的视口 y。 */
  portraitBottom: number
  /** 鲸鱼娘爪尖压进标题的像素数。 */
  clawOverlap: number
  /** 鲸鱼娘水平居中偏差。 */
  whaleCenterOffset: number
  /** 当前视口。 */
  viewport: [number, number]
}

/**
 * 隐藏 hero 三件套。切到对话页必须做——否则它们会带着过期坐标留在屏幕上，
 * 和 Q 版角色撞在一起。
 * @param nodes - hero 节点。
 */
function hide(nodes: HeroNodes): void {
  for (const el of [nodes.portrait, nodes.whale, nodes.tagline]) el.style.display = 'none'
}

/**
 * 侧栏字标改成错开两行：隐掉鲸鱼字符，把 HARNESS 徽章整体平移到第二行。
 *
 * 纯位移，不旋转、不重画、不换字体。水平 −33.8 让 H 对齐 "ek" 的 e，
 * 此时末尾 SS 探出 k 右缘约 23px；对齐 s 时 SS 反而收在 k 以内，视觉不平衡。
 * @returns 是否完成了手术（false 表示 SVG 还没渲染出来，下一帧再试）。
 */
export function brandSurgery(): boolean {
  const svg = document.querySelector(`${SELECTORS.brand} svg`)
  if (svg === null) return false
  if (svg.getAttribute('data-joi-done') === '1') return true

  // 记录每个将被移动节点的原位（父 + 原后继），否则这台手术是单向的，
  // 切回原生时还不回去。SVG 的绘制顺序就是文档顺序，位置记准了才能复原。
  const remember = (node: Element): void => {
    if (node.parentNode === null) return
    origin.set(node, { parent: node.parentNode, next: node.nextSibling })
  }

  // 必须用 querySelectorAll：鲸鱼字符与部分字母包在 <g> 里，
  // svg.children 只拿得到 deepseek 那 9 个直接子 path。
  const paths = [...svg.querySelectorAll('path')]
  if (paths.length === 0) return false
  const boxed = paths
    .map(p => ({ p, x: p.getBBox().x }))
    .sort((m, n) => m.x - n.x)
  const letters = boxed.filter(b => b.x > 128).map(b => b.p)
  if (letters.length === 0) return false // 尚未布局，等下一帧

  const whaleGlyph = boxed[0]?.p
  if (whaleGlyph !== undefined) {
    hiddenGlyphs.add(whaleGlyph)
    whaleGlyph.style.display = 'none'
  }

  const [dx, dy] = GEOMETRY.brandLockup.svgSurgery.shift
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('transform', `translate(${dx},${dy})`)
  const plate = svg.querySelector('rect')
  if (plate !== null) { remember(plate); g.append(plate) } // 原生徽章底板，保持在字母之下
  for (const letter of letters) { remember(letter); g.append(letter) }
  svg.append(g)
  moved.add(g)
  svg.setAttribute('data-joi-done', '1')
  return true
}

/** 被搬动过的节点的原位。还原时按它把节点放回去。 */
const origin = new Map<Element, { parent: ParentNode, next: ChildNode | null }>()
/** 本插件建出来的 <g>，还原时删掉。 */
const moved = new Set<Element>()
/** 被藏起来的原生字符，还原时取消隐藏。 */
const hiddenGlyphs = new Set<SVGElement>()

/**
 * 撤销字标手术，把 SVG 还原成 app 渲染时的样子。
 *
 * 顺序要紧：先把节点搬回原位，再删空的 <g>——反过来会把节点一起带走。
 */
export function undoBrandSurgery(): void {
  for (const [node, at] of origin) {
    // 记下的"原后继"未必还在：React 随时可能重渲染字标，把当时的兄弟换掉。
    // 那种情况下 insertBefore 会抛 NotFoundError，退回追加即可——
    // SVG 的绘制顺序就是文档顺序，字母原本也在末尾，追加不改观感。
    const next = at.next !== null && at.next.parentNode === at.parent ? at.next : null
    try {
      at.parent.insertBefore(node, next)
    } catch {
      // 连父节点都已不在文档里：这颗节点随旧树一起走了，没什么可还原的。
    }
  }
  origin.clear()
  for (const g of moved) g.remove()
  moved.clear()
  for (const glyph of hiddenGlyphs) glyph.style.removeProperty('display')
  hiddenGlyphs.clear()
  document.querySelector(`${SELECTORS.brand} svg`)?.removeAttribute('data-joi-done')
}
