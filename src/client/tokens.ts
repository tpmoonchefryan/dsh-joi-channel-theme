/**
 * 一套衣装 → 一层 token 覆盖。
 *
 * 两层叠着用，缺一不可：
 *   ① 19 级中性色阶 —— 它只在 design-platform.css 的 body{} 里定义一次，
 *      明暗两套 alias 各自引用其中不同级数。覆盖一次色阶 = 明暗双向同时生效，
 *      并且自动兜住这份映射表没列举到的组件。
 *   ② 44 条语义 alias 直写 —— 色阶只能给出整体色调倾向，给不出「底色 #FFFAF2 /
 *      面板 #FFFFFF」这种分层：app 的浅色主题里 bg-base、layer-1、layer-3、按钮、
 *      输入框全部映射到同一级 static-00，分层是靠描边而非填色做的。
 *
 * 交付方式是 ctx.theme.overrideTokens，不是自己写 <style>。presenter 会把
 * 快照里的 token 逐条 setProperty 到 body 的行内样式上——行内优先级高过
 * design-platform.css 的 body{} 规则，而且插件 dispose 时 presenter 自己收回。
 */
import { PALETTE, RAMP, SHIKI, TEXTURE, TOKEN_MAP, type Suit } from '../generated/baseline.ts'
import { ASSETS } from '../generated/assets.ts'

/** 一个 token 在明暗两态下的取值。overrideTokens 要求两态都给。 */
export interface TokenModes {
  /** 浅色底色板生效时的值。 */
  light: string
  /** 深色底色板生效时的值。 */
  dark: string
}

/** 一层覆盖：token 名 → 明暗值对。 */
export type TokenOverrides = Record<string, TokenModes>

/**
 * 组装一套衣装的完整 token 覆盖层。
 * @param suit - 衣装。
 * @returns 可直接交给 ctx.theme.overrideTokens 的覆盖表。
 */
export function tokensFor(suit: Suit): TokenOverrides {
  const out: TokenOverrides = {}

  // ① 中性色阶。色阶本身与明暗无关（明暗差异体现在 alias 引用哪一级），
  //    所以两态同值——overrideTokens 要求两态都写，这里如实重复。
  const ramp = RAMP[suit]
  RAMP.steps.forEach((step, i) => {
    const value = ramp[i]
    if (value === undefined) return
    out[`${RAMP.prefix}${step}`] = { light: value, dark: value }
  })

  // ② 语义 alias。
  const light = PALETTE[suit].light
  const dark = PALETTE[suit].dark
  for (const [token, semantic] of Object.entries(TOKEN_MAP)) {
    const l = light[semantic]
    const d = dark[semantic]
    // 生成器已在构建期校验过映射完整性；这里只是运行期的静默兜底，
    // 不该抛——一个缺失的槽位不值得让整个主题挂掉。
    if (l === undefined || d === undefined) continue
    out[token] = { light: l, dark: d }
  }

  // ③ 语法配色。shiki.css 不引用任何 alias，色阶与 ② 都够不着它。
  const shikiLight = SHIKI[suit].light
  const shikiDark = SHIKI[suit].dark
  for (const key of Object.keys(shikiLight)) {
    const l = shikiLight[key]
    const d = shikiDark[key]
    if (l === undefined || d === undefined) continue
    out[`--shiki-token-${key}`] = { light: l, dark: d }
  }

  // ④ 本插件私有变量。
  //
  // 覆盖层不校验 token 名，所以这一层可以承载 app 词汇表里没有的东西：
  // 底纹图案、描边色、气泡文字色。把它们也做成 token 的好处是样式表因此
  // 完全静态——换装只换 token，一行 CSS 都不用重建，也就没有「样式表与
  // 当前衣装不同步」这一类状态可言。
  Object.assign(out, privateVars(suit))

  return out
}

/**
 * 组装本插件私有的 CSS 变量。
 * @param suit - 衣装。
 * @returns 私有变量的明暗值对。
 */
function privateVars(suit: Suit): TokenOverrides {
  const l = PALETTE[suit].light
  const d = PALETTE[suit].dark
  const pair = (light: string | undefined, dark: string | undefined): TokenModes =>
    ({ light: light ?? 'transparent', dark: dark ?? 'transparent' })

  const logo = suit === 'flowers' ? ASSETS.logoFlowers : ASSETS.logoLibrary

  return {
    // 侧栏双人 logo。做成 token 而不是在装饰层里写 style，是因为 app 对
    // .r91kyq_brand 用了 background 简写——外部设的 background-image 会被
    // 整条抹掉。样式表里那条带 !important 的规则引用这个变量，换装即换图。
    '--joi-brand-logo': { light: `url('${logo}')`, dark: `url('${logo}')` },
    // 气泡文字色随气泡底走：Flowers 金底配深棕字，Library 灰底配正文色。
    '--joi-bubble-ink': pair(l.bubbleInk, d.bubbleInk),
    // 发送键的字形色。浅色下橘偏深配白字；深色下橘本身偏亮，改配深字。
    '--joi-send-ink': { light: '#FFFFFF', dark: d.goldInk ?? '#FFFFFF' },
    // 叶：🍊 上那片绿叶，语义槽里的第七个。状态点的「成功」取它。
    '--joi-leaf': pair(SHIKI[suit].light.string, SHIKI[suit].dark.string),
    // StateDot 的两格：成功走叶，运行走橘。10px 太小放不下角色，
    // 纯色点即可——这是「出现频率与允许尺寸成反比」触底的地方。
    '--dsw-alias-state-success-primary': pair(SHIKI[suit].light.string, SHIKI[suit].dark.string),
    '--dsh-state-ongoing': pair(l.tangerine, d.tangerine),
    // 底纹的整张图案与瓦片尺寸。做成变量后 .joi-tex 那条规则一次写死。
    '--joi-texture-image': { light: textureImage(suit, 'light'), dark: textureImage(suit, 'dark') },
    '--joi-texture-size': { light: TEXTURE[suit].tile, dark: TEXTURE[suit].tile },
    // 立绘边缘光：浅色下 Library 的白开衫贴近白底会糊，深色下则要一圈冷光把她从背景里拉出来。
    '--joi-rim': {
      light: 'drop-shadow(0 0 1px rgba(70,80,100,.30)) drop-shadow(0 2px 10px rgba(70,80,100,.13))',
      dark: 'drop-shadow(0 0 1px rgba(255,255,255,.16)) drop-shadow(0 0 22px rgba(0,0,0,.5))',
    },
    // 接触阴影：向下偏移的软阴影落在标题那条线上，替代被牺牲掉的遮挡量。
    '--joi-contact-shadow': {
      light: 'drop-shadow(0 5px 4px rgba(56,42,52,.20))',
      dark: 'drop-shadow(0 5px 5px rgba(0,0,0,.48))',
    },
    // 两张 logo 的白描边是烘焙进图里的，浅色主题下会消失，靠外阴影补轮廓。
    '--joi-logo-rim': {
      light: 'drop-shadow(0 0 1px rgba(0,0,0,.28)) drop-shadow(0 1px 2px rgba(0,0,0,.10))',
      dark: 'none',
    },
  }
}

/**
 * 生成一套衣装在一种明暗下的底纹 background-image。
 *
 * 两层必须共用同一瓦片尺寸。曾用 28px / 38px 两个尺寸，最小公倍数 532px，
 * 两套点格互相漂移、每 532px 才重合一次，整片读成噪点而不是图案（莫尔干涉）。
 * 同尺寸 + 瓦片内错位放点，观感仍是散落的，但严格重复。
 * @param suit - 衣装。
 * @param mode - 明暗。
 * @returns 可直接赋给 background-image 的值。
 */
function textureImage(suit: Suit, mode: 'light' | 'dark'): string {
  const p = PALETTE[suit][mode]
  const spec = TEXTURE[suit]
  // 透明度按明暗分开取：同一 alpha 打在近黑底上，对比度约为浅底的 3 倍。
  const tint = (color: string, alpha: string): string =>
    `color-mix(in srgb, ${p[color] ?? 'transparent'} ${p[alpha] ?? '0%'}, transparent)`

  return spec.layers.map((layer) => {
    if ('at' in layer) {
      // 点阵：一层花瓣、一层瞳金，瓦片内错位。
      return `radial-gradient(circle at ${layer.at}, ${tint(layer.color, layer.alpha)} 0 ${layer.r}, transparent ${layer.edge})`
    }
    // 方格纸：横竖各一条制图线。
    return `linear-gradient(${layer.dir}, ${tint(layer.color, layer.alpha)} 0 ${layer.w}, transparent ${layer.w})`
  }).join(', ')
}

/**
 * 数一层覆盖里的 token 条数（回归断言与体积报告用）。
 * @param suit - 衣装。
 * @returns 该衣装覆盖层的 token 数。
 */
export function tokenCount(suit: Suit): number {
  return Object.keys(tokensFor(suit)).length
}
