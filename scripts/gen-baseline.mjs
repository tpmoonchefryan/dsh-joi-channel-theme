/**
 * design/baseline-4q.json → src/generated/baseline.ts
 *
 * 锚点与色值只有一个来源。设计阶段的教训是手抄必漂移：一处改了另一处不知道，
 * 而漂移在四象限里表现为「某一象限某个 token 不对」，回溯成本远高于生成成本。
 * 所以基线 JSON 是权威，这个脚本是它到代码的唯一通道，src/generated 不手改。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(ROOT, 'design/baseline-4q.json')
const OUT = resolve(ROOT, 'src/generated/baseline.ts')

const b = JSON.parse(readFileSync(SRC, 'utf8'))

/** 去掉 JSON 里给人读的注释键，它们不该进产物。 */
const strip = (o) => Object.fromEntries(
  Object.entries(o).filter(([k]) => !k.startsWith('$')),
)

const palette = {
  flowers: { light: strip(b.palette.flowers.light), dark: strip(b.palette.flowers.dark) },
  library: { light: strip(b.palette.library.light), dark: strip(b.palette.library.dark) },
}
const tokenMap = strip(b.tokenMap)
const ramp = {
  prefix: b.neutralRamp.prefix,
  steps: b.neutralRamp.steps,
  flowers: b.neutralRamp.flowers,
  library: b.neutralRamp.library,
}
const texture = { flowers: strip(b.texture.flowers), library: strip(b.texture.library) }
const shiki = { flowers: strip(b.shiki.flowers), library: strip(b.shiki.library) }
const ripeness = { stops: b.ripeness.stops, leaf: b.ripeness.leaf, stem: b.ripeness.stem }
const geometry = {
  portrait: strip(b.geometry.portrait),
  whaleMusume: strip(b.geometry.whaleMusume),
  brandLockup: strip(b.geometry.brandLockup),
}

// 生成前先自检：色阶级数与色值数必须等长，否则下标错位会静默产出错误主题。
for (const suit of ['flowers', 'library']) {
  if (ramp[suit].length !== ramp.steps.length) {
    throw new Error(`neutralRamp.${suit} 有 ${ramp[suit].length} 值，steps 有 ${ramp.steps.length} 级`)
  }
  for (const mode of ['light', 'dark']) {
    const p = palette[suit][mode]
    for (const semantic of Object.values(tokenMap)) {
      if (!(semantic in p)) throw new Error(`tokenMap 引用了 ${suit}.${mode} 没有的语义色 "${semantic}"`)
    }
  }
}

const j = (v) => JSON.stringify(v, null, 2)
writeFileSync(OUT, `/* 由 scripts/gen-baseline.mjs 从 design/baseline-4q.json 生成，请勿手改。 */

/** 一套衣装在一种明暗下的语义色板。 */
export type Palette = Record<string, string>

/** 衣装标识。两套互斥，不得混用（设计法条）。 */
export type Suit = 'flowers' | 'library'

/** 四象限语义色板：衣装 × 明暗。 */
export const PALETTE: Record<Suit, Record<'light' | 'dark', Palette>> = ${j(palette)}

/** 语义色 → 真实 --dsw-* token 的映射（${Object.keys(tokenMap).length} 条）。 */
export const TOKEN_MAP: Record<string, string> = ${j(tokenMap)}

/** 中性色阶：兜住未列举组件。只在 body{} 定义一次，覆盖一次明暗双向生效。 */
export const RAMP = ${j(ramp)} as const

/** 底纹参数：Flowers 点阵（衣料樱花印花）/ Library 方格纸（裙面制图线）。 */
export const TEXTURE = ${j(texture)} as const

/**
 * 语法配色：shiki.css 是独立表，不引用任何 alias，色阶覆盖对它无效，
 * 必须两套直写。constant/link 两套同值（客观事实不随衣装变）。
 */
export const SHIKI: Record<Suit, Record<'light' | 'dark', Record<string, string>>> = ${j(shiki)}

/** 上下文计量的橘子成熟度色阶：相邻档线性插值；叶恒绿、蒂恒褐。 */
export const RIPENESS = ${j(ripeness)} as const

/** 实测几何锚点（参照视口 1520×960）。 */
export const GEOMETRY = ${j(geometry)} as const
`, 'utf8')

mkdirSync(dirname(OUT), { recursive: true })
// shiki 的九个 token 也要四象限齐全，缺一格就会有一个象限落回通用蓝绿粉紫。
const shikiKeys = Object.keys(shiki.flowers.light)
for (const suit of ['flowers', 'library']) {
  for (const mode of ['light', 'dark']) {
    const got = Object.keys(shiki[suit][mode])
    if (got.length !== shikiKeys.length) throw new Error(`shiki.${suit}.${mode} 有 ${got.length} 项，应为 ${shikiKeys.length}`)
  }
}
if (shiki.flowers.light.constant !== shiki.library.light.constant
  || shiki.flowers.dark.constant !== shiki.library.dark.constant
  || shiki.flowers.light.link !== shiki.library.light.link
  || shiki.flowers.dark.link !== shiki.library.dark.link) {
  throw new Error('shiki constant/link 必须两套同值（客观事实不随衣装变）')
}

console.log(`baseline → ${OUT}
  ${Object.keys(tokenMap).length} tokens · ${ramp.steps.length} ramp steps · ${shikiKeys.length} shiki · ${ripeness.stops.length} ripeness · 4 quadrants`)
