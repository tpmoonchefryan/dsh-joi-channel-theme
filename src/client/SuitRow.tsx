/**
 * 「换装」设置行 —— 遮蔽内置的「外观」行。
 *
 * 走 cell shadowing：同 slot、同 id 'appearance'、priority 低于内置的 0。
 * 这是 ui-slots 文档化的替换路径（同一格里最低 priority 的那条渲染），
 * 所以不用 fork ui-theme，插件卸载后内置行自动回归。
 *
 * 两层结构：
 *   上 = 三张外观卡（两套衣装 + 原生）
 *   下 = 明暗三方块
 * 明暗永远归 app —— 衣装换的是色相，不是明暗。选了「原生」也一样：
 * 那一栏关掉的是本插件的外观，不是宿主的明暗偏好。
 *
 * 「换装」这个词是银翼杀手 Joi 元叙事唯一落到产品文案的地方。副题
 * 「选一套衣装，房间会跟着换」把 token 覆盖这件事翻译成用户能懂的因果。
 *
 * ── 排版一律照抄原生，见下方 NATIVE ──
 * 本行遮蔽的是 ui-theme 的 AppearanceRow，所以它的 module.css 就是本行的规范
 * 正本，逐值对齐而不是目测。此前这里的数值是手写的（标题 600、行无上下留白、
 * 无分隔线、明暗做成小药丸），夹在原生行中间一眼就能看出不是同一套东西。
 * 手写数值还有个更要命的问题：它不跟着宿主走，app 改了行规范这里不会知道。
 */
import { useState } from 'react'
import {
  IconDarkOutline16, IconFollowsystemOutline16, IconLightOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { PALETTE } from '../generated/baseline.ts'
import { SKINS, type Skin } from '../contract.ts'
import type { createSuitRowStore } from './suit-row-store.ts'

/** app 的内置明暗偏好。 */
type Preference = 'light' | 'dark' | 'system'

/** 注入的业务面：两个写入动作。 */
export interface SuitRowInjected {
  /** 换一套皮肤（两套衣装或原生）。 */
  setSuit: (skin: Skin) => void
  /** 切明暗偏好（转交给 ctx.theme，插件自己不碰 body 属性）。 */
  setTheme: (preference: Preference) => void
}

/** 完整 props：store 份额 + 注入面。 */
export type SuitRowProps = PropsStore<ReturnType<typeof createSuitRowStore>> & SuitRowInjected

/**
 * 三张卡的文案。性格标签是设计稿里两套衣装的人格总结。
 *
 * 「原生」曾被放在 设置 → 插件 → 插件配置，理由是它属于插件治理而非外观偏好。
 * 那个理由站不住：关掉它并不停用插件——bundle 照样装着、照样加载，插件列表里
 * 的状态一动不动，它切的自始至终只是 suit 字段（native 本就是该字段的合法值）。
 * 摆在插件配置里反而暗示「这是插件开关」，比「原生也算一套」误导更甚。
 * 用户要回答的问题只有一个：这个房间用哪种外观。三个选项就该并排。
 */
const SKIN_CARDS: Record<Skin, { name: string, tag: string }> = {
  flowers: { name: 'Joi · Flowers', tag: '暖 · 舞台 · 陪伴' },
  library: { name: 'Joi · Library', tag: '冷 · 整理 · 专注' },
  native: { name: 'DeepSeek 原生', tag: '不使用本主题 · 插件保持安装' },
}

/** 明暗三方块，与内置行同序同图标。 */
const CUBES: ReadonlyArray<{ id: Preference, label: string, Icon: typeof IconLightOutline16 }> = [
  { id: 'light', label: '浅色', Icon: IconLightOutline16 },
  { id: 'dark', label: '深色', Icon: IconDarkOutline16 },
  { id: 'system', label: '跟随系统', Icon: IconFollowsystemOutline16 },
]

/**
 * 原生行规范。逐值取自 ui-theme 的 `AppearanceRow.module.css`
 * （`.group` / `.title` / `.themeCube` / `.selected`），本行照抄。
 *
 * 只有一处刻意不抄：原生选中态的描边用 `--dsw-static-neutral-bluish-400`，
 * 那是**静态**令牌，不进本插件的覆盖层，落在暖色衣装里会是一道发蓝的灰边。
 * 这里换成 `--dsw-alias-brand-primary`——同样是"填充 + 强调描边"的结构，
 * 但颜色跟着衣装走。填充仍用原生的 `--dsw-alias-bg-module-platform`。
 */
const NATIVE = {
  /** `.group`：列向、间距 8、上下留白 16、底部发丝线。 */
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '16px 0',
    borderBottom: '1px solid var(--dsw-alias-border-l2)',
  },
  /** `.title`：14 / 400 / 22px。此前写成 600，是本次最显眼的偏差。 */
  title: {
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '22px',
    color: 'var(--dsw-alias-label-primary)',
  },
  /** 副题：取自带描述的原生行（`.desc` 12 / 400 / 18px / tertiary）。 */
  desc: {
    fontSize: 12,
    fontWeight: 400,
    lineHeight: '18px',
    color: 'var(--dsw-alias-label-tertiary)',
  },
  /** `.themeCube`：三个一行、等分、圆角 16、发丝边、透明底。 */
  cube: {
    boxSizing: 'border-box',
    flex: '1 1 180px',
    display: 'flex',
    border: '1px solid var(--dsw-alias-border-l2)',
    borderRadius: 16,
    background: 'transparent',
    font: 'inherit',
    fontSize: 14,
    lineHeight: '22px',
    color: 'var(--dsw-alias-label-primary)',
    cursor: 'pointer',
  },
  /** `.cubeRow`：等高、间距 8、窄了换行。 */
  cubeRow: { display: 'flex', alignItems: 'stretch', gap: 8, flexWrap: 'wrap' },
} as const

/** `.selected`：填充 + 强调描边。描边色的偏离理由见 NATIVE 的说明。 */
const SELECTED = {
  background: 'var(--dsw-alias-bg-module-platform)',
  borderColor: 'var(--dsw-alias-brand-primary)',
} as const

/**
 * `.themeCube:hover:not(.selected)` 的等价物。
 *
 * 该令牌是半透明白叠加（rgba(255,255,255,.08)），与皮肤无关，两套衣装、
 * 明暗都成立，所以直接用 app 的值而不进本插件的覆盖层。
 *
 * 用组件状态而不是 CSS `:hover`：内联样式写不了伪类，而放进本插件的静态
 * 样式表又会在原生态下随整表一起停用——那时这一行仍然显示，悬浮反馈却没了。
 */
const HOVER = { background: 'var(--dsw-alias-interactive-bg-hover)' } as const

/** 三色缩览取哪三个语义槽：底色、品牌色、瞳金——一眼能分辨两套衣装。 */
const SWATCH = ['ground', 'brand', 'gold'] as const

/**
 * 原生卡的三色缩览：直接读 app 自己的令牌，而不是本插件调色板里的任何一组。
 * 它因此随宿主主题实时变化，视觉上就与两张衣装卡区分开——那两张是固定的成品色。
 */
const NATIVE_SWATCH = [
  'var(--dsw-alias-bg-base)',
  'var(--dsw-alias-brand-primary)',
  'var(--dsw-alias-label-secondary)',
] as const

/**
 * 渲染换装行。
 * @param props - 合成后的 slot props。
 * @returns 行的元素树。
 */
export function SuitRow({ useStore, setSuit, setTheme }: SuitRowProps): React.JSX.Element {
  const suit = useStore(s => s.suit)
  const preference = useStore(s => s.preference)
  // 六个按钮共用一个悬浮标识：两组的 id 不重叠（衣装 vs 明暗偏好）。
  const [hovered, setHovered] = useState<string | null>(null)
  /** 未选中的那个才有悬浮态——与原生的 `:hover:not(.selected)` 同义。 */
  const hoverOf = (id: string, selected: boolean): object =>
    (!selected && hovered === id ? HOVER : {})
  const hoverProps = (id: string): object => ({
    onMouseEnter: () => { setHovered(id) },
    onMouseLeave: () => { setHovered(cur => (cur === id ? null : cur)) },
  })

  return (
    <div style={NATIVE.group}>
      {/* 标题 + 副题：原生带描述的行把两者放进 gap 4 的子列，这里同构。 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={NATIVE.title}>换装</div>
        <div style={NATIVE.desc}>选一套衣装，房间会跟着换；也可以回到 DeepSeek 原生外观</div>
      </div>

      {/* 衣装卡与明暗方块共用 .cubeRow / .themeCube 的骨架，两行才对得齐。 */}
      <div style={NATIVE.cubeRow}>
        {SKINS.map((id) => {
          const selected = suit === id
          const card = SKIN_CARDS[id]
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => { setSuit(id) }}
              {...hoverProps(id)}
              style={{
                ...NATIVE.cube,
                // 卡片是三行内容（缩览／名称／标签），比原生方块的两行高，
                // 故只收窄纵向留白；横向与圆角、描边、字号一律照原生。
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: 6,
                padding: '14px 16px',
                textAlign: 'left',
                ...hoverOf(id, selected),
                ...(selected ? SELECTED : {}),
              }}
            >
              <div style={{ display: 'flex', gap: 4 }}>
                {(id === 'native'
                  ? NATIVE_SWATCH
                  : SWATCH.map(slot => PALETTE[id].light[slot])
                ).map((color, i) => (
                  <span
                    key={color + String(i)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      background: color,
                      border: '1px solid var(--dsw-alias-border-l2)',
                    }}
                  />
                ))}
              </div>
              <div>{card.name}</div>
              <div style={NATIVE.desc}>{card.tag}</div>
            </button>
          )
        })}
      </div>

      <div style={NATIVE.cubeRow}>
        {CUBES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={preference === id}
            onClick={() => { setTheme(id) }}
            {...hoverProps(id)}
            style={{
              ...NATIVE.cube,
              // `.themeCube` 原样：图标在上、文字在下，居中，留白 20/32。
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '20px 32px',
              ...hoverOf(id, preference === id),
              ...(preference === id ? SELECTED : {}),
            }}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
