/**
 * 上下文计量：把发送键旁那个 28px 的进度环换成一颗会成熟的橘子。
 *
 * 提案里原写作「橘子瓣填充的进度条」，读源码后发现 ContextMeter 不是条、
 * 是个环；而更要紧的是分瓣填充只是把进度条弯成了环，并没有真正用上「橘子」
 * 这个符号本身能表达的东西。改用成熟度：上下文吃得越多，橘子越熟
 * （深绿 → 浅绿 → 浅黄 → 明黄 → 橙红）。这是一个本来就带方向性的自然过程，
 * 青涩到熟透，谁都不用学就知道哪头是「快到头了」。
 *
 * 叶恒绿、蒂恒褐：它们是身份标记，成熟的只是果肉——与「人的颜色会换，
 * 工具的颜色不换」是同一条思路。
 *
 * 代价要说明：颜色比弧长读不出精确数值。但这个控件本来就有点开的明细面板，
 * 精确值归它；环上这一眼只需要回答「还早 / 该收了」。所以原生的 <circle>
 * 只是被藏起来而不是删掉——面板、tooltip、点击行为全部原样保留。
 */
import { RIPENESS } from '../generated/baseline.ts'

/** 本插件插进去的那层橘子的标记。 */
const MARK = 'data-joi-orange'

/**
 * 按占用率取果肉颜色：相邻档之间线性插值，读起来是连续变熟而不是跳档。
 * @param percent - 上下文占用百分比 0..100。
 * @returns 十六进制颜色。
 */
export function ripeColor(percent: number): string {
  const stops = RIPENESS.stops
  const p = Math.min(100, Math.max(0, percent))
  let lo = stops[0] as [number, string]
  for (const stop of stops) {
    const s = stop as [number, string]
    if (s[0] <= p) lo = s
  }
  const hi = (stops.find(s => (s as [number, string])[0] > p) ?? lo) as [number, string]
  if (hi[0] === lo[0]) return lo[1]
  return mix(lo[1], hi[1], (p - lo[0]) / (hi[0] - lo[0]))
}

/**
 * 两个十六进制色的线性混合。
 * @param a - 起点色。
 * @param b - 终点色。
 * @param t - 0..1 的位置。
 * @returns 混合后的十六进制色。
 */
function mix(a: string, b: string, t: number): string {
  const ch = (hex: string, i: number): number => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  const out = [0, 1, 2].map(i => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t))
  return `#${out.map(v => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
}

/**
 * 从原生环上读出当前占用率。
 *
 * 取 stroke-dasharray 而不是 aria-label：dasharray 是渲染用的精确数，
 * aria 文案会随语言变（「上下文已用 45%」/「45% of context used」），
 * 按文案解析等于把主题绑死在某一种语言上。
 * @param fill - 原生的进度圆。
 * @returns 占用百分比，读不出则 undefined。
 */
function readPercent(fill: Element): number | undefined {
  const dash = fill.getAttribute('stroke-dasharray')
  if (dash === null) return undefined
  const [drawn, total] = dash.split(/\s+/).map(Number)
  if (drawn === undefined || total === undefined || !(total > 0)) return undefined
  return (drawn / total) * 100
}

/**
 * 把计量环画成橘子。原生元素只藏不删。
 * @returns 当前占用率（没找到控件时 undefined），供量测读取。
 */
export function paintMeter(): number | undefined {
  const fill = document.querySelector('svg[viewBox="0 0 14 14"] circle[class*=_fill]')
  const svg = fill?.closest('svg')
  if (fill === null || svg === null || svg === undefined) return undefined

  const percent = readPercent(fill)
  if (percent === undefined) return undefined

  // 原生两个圆藏起来：面板与点击行为挂在外层 trigger 上，不受影响。
  //
  // 必须是 :scope > circle。用后代选择器会从第二次绘制起连同下面塞进去的
  // 果肉一起藏掉——而重绘正是被本函数自己的 svg.append(group) 触发的
  // MutationObserver 引发的，所以必然重入：首帧绿、之后变白（露出原生淡环）。
  for (const circle of svg.querySelectorAll(':scope > circle')) {
    ;(circle as SVGElement).style.display = 'none'
  }

  let group = svg.querySelector(`g[${MARK}]`)
  if (group === null) {
    group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    group.setAttribute(MARK, '1')
    // 果身 → 高光 → 蒂 → 叶。顺序即层序。
    group.innerHTML = '<circle cx="7" cy="7.7" r="5" data-part="flesh"></circle>'
      + '<ellipse cx="5.2" cy="5.9" rx="1.5" ry="1.1" fill="#fff" opacity=".22"></ellipse>'
      + `<rect x="6.6" y="1.5" width="0.9" height="1.9" rx="0.45" fill="${RIPENESS.stem}"></rect>`
      + `<path d="M7.4 2.5 C9.2 1.1 11 1.5 11 1.5 C11 1.5 10.4 3.4 8.5 3.6 Z" fill="${RIPENESS.leaf}"></path>`
    svg.append(group)
  }
  const flesh = group.querySelector('[data-part=flesh]')
  flesh?.setAttribute('fill', ripeColor(percent))
  return Math.round(percent)
}

/**
 * 还原原生计量环。
 */
export function unpaintMeter(): void {
  for (const group of document.querySelectorAll(`g[${MARK}]`)) {
    const svg = group.closest('svg')
    group.remove()
    for (const circle of svg?.querySelectorAll('circle') ?? []) {
      ;(circle as SVGElement).style.removeProperty('display')
    }
  }
}
