/**
 * 四象限回归。
 *
 * 分两半，因为这两半的失败方式不同：
 *
 *   静态半 —— 纯计算，无需浏览器。断言「设计基线 → 生成产物 → token 覆盖层」
 *   这条链上没有丢值、没有串味、没有违反法条（鲸蓝恒定、金色配额、
 *   constant/link 不换装）。这一半每次构建都该跑。
 *
 *   实况半 —— 需要真实 UI。浏览器里的装饰层会把量测写到
 *   `#joi-theme-css[data-joi-metrics]`；把四个象限各抓一份 JSON 交给本脚本，
 *   它按冻结基线逐项判定。之所以走 DOM 属性而不是页面全局变量：
 *   自动化取证跑在隔离世界里，读得到 DOM，读不到页面的 window。
 *
 * 用法：
 *   node scripts/verify-4q.mjs                    只跑静态半
 *   node scripts/verify-4q.mjs capture/*.json     连实况半一起跑
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const B = JSON.parse(readFileSync(resolve(ROOT, 'design/baseline-4q.json'), 'utf8'))

let failures = 0
let checks = 0

/**
 * 一条断言。
 * @param label - 断言名。
 * @param ok - 是否通过。
 * @param detail - 失败时补充说明。
 */
function check(label, ok, detail = '') {
  checks++
  if (ok) return
  failures++
  console.log(`  ✗ ${label}${detail === '' ? '' : ` — ${detail}`}`)
}

/**
 * 相等断言。
 * @param label - 断言名。
 * @param actual - 实际值。
 * @param expected - 期望值。
 */
function eq(label, actual, expected) {
  check(label, Object.is(actual, expected), `实际 ${JSON.stringify(actual)}，期望 ${JSON.stringify(expected)}`)
}

// ══ 静态半 ═══════════════════════════════════════════════════════════
console.log('静态半：基线 → 生成产物 → token 覆盖层')

const gen = resolve(ROOT, 'src/generated/baseline.ts')
check('生成产物存在（先跑 npm run gen）', existsSync(gen))
if (!existsSync(gen)) process.exit(1)

// 直接从基线 JSON 复算覆盖层，与 src/client/tokens.ts 同规则。
// 复算而不是 import 编译产物：这样断言的是「基线怎么说」，
// 而不是「代码怎么做」——否则代码写错了断言会跟着一起错。
const SUITS = ['flowers', 'library']
const MODES = ['light', 'dark']
const tokenMap = Object.fromEntries(Object.entries(B.tokenMap).filter(([k]) => !k.startsWith('$')))

for (const suit of SUITS) {
  const ramp = B.neutralRamp[suit]
  eq(`${suit} 色阶级数`, ramp.length, B.neutralRamp.steps.length)
  for (const mode of MODES) {
    const p = B.palette[suit][mode]
    for (const [token, semantic] of Object.entries(tokenMap)) {
      check(`${suit}.${mode} ${token} → ${semantic}`, typeof p[semantic] === 'string')
    }
    const shiki = B.shiki[suit][mode]
    eq(`${suit}.${mode} shiki 项数`, Object.keys(shiki).length, 9)
  }
}

// 法条一：鲸蓝恒定。它代表引擎，不是 Joi 的衣服。
for (const mode of MODES) {
  eq(`鲸蓝 ${mode} 两套同值`, B.palette.flowers[mode].whale, B.palette.library[mode].whale)
  eq(`shiki constant ${mode} 两套同值`, B.shiki.flowers[mode].constant, B.shiki.library[mode].constant)
  eq(`shiki link ${mode} 两套同值`, B.shiki.flowers[mode].link, B.shiki.library[mode].link)
}

// 法条二：金色配额。#FFCE65 只允许 Flowers 大面积用；Library 的用户气泡
// 必须是灰底，金只留给状态与点缀。这条一破，两套衣装就串味了。
eq('Flowers 气泡 = 瞳金', B.palette.flowers.light.bubble, '#FFCE65')
check('Library 气泡不是瞳金', B.palette.library.light.bubble !== '#FFCE65',
  `实际 ${B.palette.library.light.bubble}`)
check('Library 底色不是瞳金系', !B.palette.library.light.ground.toUpperCase().startsWith('#FFCE'))

// 法条三：两套底纹是不同图案，不是同图案换色。
eq('Flowers 底纹 = 点阵', 'at' in B.texture.flowers.layers[0], true)
eq('Library 底纹 = 网格', 'dir' in B.texture.library.layers[0], true)
// 两层同瓦片尺寸，否则出莫尔。
for (const suit of SUITS) {
  const sizes = B.texture[suit].tile.split(',').map(s => s.trim())
  eq(`${suit} 底纹两层同瓦片`, sizes[0], sizes[1])
}

// 成熟度：单调递增且首尾就位。
const stops = B.ripeness.stops
check('成熟度档位单调递增', stops.every((s, i) => i === 0 || s[0] > stops[i - 1][0]))
eq('成熟度起点 0%', stops[0][0], 0)
eq('成熟度终点 100%', stops.at(-1)[0], 100)

// 覆盖层规模：色阶 19 + 语义 44 + shiki 9 + 私有变量。少了就是有东西没接上。
const expectedTokens = B.neutralRamp.steps.length + Object.keys(tokenMap).length + 9
console.log(`  覆盖层最少 ${expectedTokens} 条（19 色阶 + ${Object.keys(tokenMap).length} 语义 + 9 shiki）+ 私有变量`)

// 素材：内联体积与保真门槛由 gen-assets 把关，这里只确认产物在
const assets = resolve(ROOT, 'src/generated/assets.ts')
check('素材产物存在', existsSync(assets))
if (existsSync(assets)) {
  const text = readFileSync(assets, 'utf8')
  const count = (text.match(/data:image\/webp;base64,/g) ?? []).length
  eq('内联素材件数', count, 10)
  check('无外链素材', !/https?:\/\//.test(text))
  const mb = Buffer.byteLength(text, 'utf8') / 1048576
  check(`内联体积 ${mb.toFixed(2)} MB ≤ 8 MB`, mb <= 8)
}

// ══ 选择器体检 ═════════════════════════════════════════════════════════
//
// 本批 Owner 走查的 7 条里有 3 条同源：裸 [class*=] 子串匹配误伤了 app 的元素
// （CSS Modules 的 [hash]_[local] 命名让「_tab」同时是 _tabs / _table /
// _tableScroll 的前缀，「bubble」同时是 Tooltip 的局部类）。细心挡不住这类错，
// 机制才行——把每条选择器的命中集固化下来，多命中即判失败。
const auditFile = resolve(ROOT, 'capture/selector-audit.json')
if (existsSync(auditFile)) {
  console.log('\n选择器体检')
  const audit = JSON.parse(readFileSync(auditFile, 'utf8'))
  // 任何插件选择器都不该碰到这些：它们是 app 的表格、tab 容器与提示条。
  const FORBIDDEN = [/_tabs\b/, /_table/, /_tableScroll/, /^span\./]
  for (const [name, hits] of Object.entries(audit)) {
    if (name.startsWith('$')) continue
    for (const hit of hits) {
      check(`选择器 ${name} 未误伤 ${hit}`, !FORBIDDEN.some(f => f.test(hit)))
    }
    // 命中集必须是单一种类：一条选择器同时命中两类元素，通常就是子串在作祟。
    const kinds = new Set(hits.map(h => h.split('.')[0]))
    check(`选择器 ${name} 命中单一元素种类`, kinds.size <= 1, `实际 ${[...kinds].join('/')}`)
  }
  // 裸子串匹配的禁令要守在所有写选择器的地方，不止样式表。
  // 第四次栽在这上面时，出事的是 chat.ts 里的 JS 候选集——css.ts 早已限定，
  // 那份却漏了，于是 halo 打到了 Tooltip 上。
  const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  for (const file of ['src/client/css.ts', 'src/client/chat.ts', 'src/client/activity.ts']) {
    const text = strip(readFileSync(resolve(ROOT, file), 'utf8'))
    check(`${file} 不含裸 [class*=_tab]`, !/\[class\*=_tab\]/.test(text))
    // bubble 必须带元素限定：Tooltip 的局部类也叫 .bubble。
    check(`${file} 的 [class*=bubble] 均已限定元素`,
      !/(^|[^a-z\]])\[class\*=[Bb]ubble\]/.test(text))
  }
}

// ══ 实况半 ════════════════════════════════════════════════════════════
// 按内容筛而不是按文件名：capture/ 里还放着选择器体检抓样，
// 它没有 suit 字段，不是量测读数。
const captures = process.argv.slice(2)
  .filter(a => a.endsWith('.json'))
  .filter((a) => {
    try { return typeof JSON.parse(readFileSync(a, 'utf8')).suit === 'string' } catch { return false }
  })
if (captures.length === 0) {
  console.log('\n实况半：未提供抓取文件，跳过。')
  console.log('  抓法：四个象限各在浏览器控制台跑一次')
  console.log("  copy(document.getElementById('joi-theme-css').getAttribute('data-joi-metrics'))")
} else {
  console.log(`\n实况半：${captures.length} 份抓取`)
  const g = B.geometry
  const seen = new Set()
  for (const file of captures) {
    const m = JSON.parse(readFileSync(file, 'utf8'))
    const q = `${m.suit}/${m.dark ? 'dark' : 'light'}`
    seen.add(q)
    console.log(`  ── ${basename(file)} → ${q}`)
    check(`${q} 字标手术完成`, m.branded === true)
    check(`${q} 底纹有落点`, m.texturedSurfaces > 0, `实际 ${m.texturedSurfaces}`)
    if (m.hero !== undefined && m.hero !== null) {
      // 眼点按「距右缘 eyeRight」定义，随视口宽变化，所以比的是差值。
      eq(`${q} 眼点距右缘`, m.hero.viewport[0] - m.hero.eye.x, g.portrait.eyeRight)
      eq(`${q} 鲸鱼娘压入`, m.hero.clawOverlap,
        Math.round(g.whaleMusume.width * (g.whaleMusume.clawLine - g.whaleMusume.anchor)))
      check(`${q} 鲸鱼娘居中偏差 ≤2px`, Math.abs(m.hero.whaleCenterOffset) <= 2, `实际 ${m.hero.whaleCenterOffset}`)
      check(`${q} 立绘底缘贴视口底（±10px）`,
        Math.abs(m.hero.portraitBottom - m.hero.viewport[1]) <= 10,
        `实际 ${m.hero.portraitBottom} / 视口 ${m.hero.viewport[1]}`)
    }
    if (m.chat !== undefined && m.chat !== null) {
      eq(`${q} 轴伊底缘对齐落座线`, m.chat.joiFootDelta, 0)
      eq(`${q} 轴芯底缘对齐落座线`, m.chat.zhouxinFootDelta, 0)
    }
  }
  // 换装位移 0：同一明暗下两套衣装的眼点必须重合。
  for (const mode of ['light', 'dark']) {
    const pair = captures
      .map(f => JSON.parse(readFileSync(f, 'utf8')))
      .filter(m => (m.dark ? 'dark' : 'light') === mode && m.hero)
    if (pair.length === 2) {
      eq(`${mode} 换装眼点位移 X`, pair[0].hero.eye.x - pair[1].hero.eye.x, 0)
      eq(`${mode} 换装眼点位移 Y`, pair[0].hero.eye.y - pair[1].hero.eye.y, 0)
    }
  }
  for (const q of ['flowers/light', 'flowers/dark', 'library/light', 'library/dark']) {
    check(`象限 ${q} 已抓取`, seen.has(q))
  }
}

console.log(`\n${failures === 0 ? '全绿' : '有失败'}：${checks - failures}/${checks} 通过`)
process.exit(failures === 0 ? 0 : 1)
