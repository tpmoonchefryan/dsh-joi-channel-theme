/**
 * 🍊 favicon —— 元素表里橘子的第一个职责位。
 *
 * 橘子是主播的印象 emoji，两套衣装都用它；把它放到标签页图标上，
 * 主题在窗口切换器里也认得出来。SVG data URI，无外链（CSP 不放行）。
 */

/** 内联 SVG。26px 的字号在 32 画布里刚好占满而不裁切。 */
const HREF = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
  + '<text x="16" y="25" font-size="26" text-anchor="middle">🍊</text></svg>',
)}`

/**
 * 换上橘子 favicon，并在卸载时还原原图标。
 * @returns 还原 disposer。
 */
export function installFavicon(): () => void {
  const existing = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  if (existing !== null) {
    const before = { rel: existing.rel, type: existing.type, href: existing.href }
    existing.rel = 'icon'
    existing.type = 'image/svg+xml'
    existing.href = HREF
    return () => {
      existing.rel = before.rel
      existing.type = before.type
      existing.href = before.href
    }
  }
  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/svg+xml'
  link.href = HREF
  document.head.append(link)
  return () => { link.remove() }
}
