/**
 * 「换装」设置行 —— 遮蔽内置的「外观」行。
 *
 * 走 cell shadowing：同 slot、同 id 'appearance'、priority 低于内置的 0。
 * 这是 ui-slots 文档化的替换路径（同一格里最低 priority 的那条渲染），
 * 所以不用 fork ui-theme，插件卸载后内置行自动回归。
 *
 * 两层结构：
 *   上 = 三张外观卡（两套衣装 + 原生；三色缩览 + 性格标签 + 选中金边）
 *   下 = 原生的明暗三方块，原样保留
 * 明暗永远归 app —— 衣装换的是色相，不是明暗。选了「原生」也一样：
 * 那一栏关掉的是本插件的外观，不是宿主的明暗偏好。
 *
 * 「换装」这个词是银翼杀手 Joi 元叙事唯一落到产品文案的地方。副题
 * 「选一套衣装，房间会跟着换」把 token 覆盖这件事翻译成用户能懂的因果。
 */
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--dsw-alias-label-primary)' }}>换装</div>
        <div style={{ fontSize: 12, color: 'var(--dsw-alias-label-tertiary)', marginTop: 2 }}>
          选一套衣装，房间会跟着换；也可以回到 DeepSeek 原生外观
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {SKINS.map((id) => {
          const selected = suit === id
          const card = SKIN_CARDS[id]
          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => { setSuit(id) }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                background: 'var(--dsw-alias-bg-layer-2)',
                border: '1px solid var(--dsw-alias-border-l1)',
                // 选中态用瞳金环，与侧栏选中会话同一套语言。
                boxShadow: selected ? '0 0 0 2px var(--dsw-alias-state-warn-primary)' : 'none',
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
              <div style={{ fontSize: 13, color: 'var(--dsw-alias-label-primary)' }}>{card.name}</div>
              <div style={{ fontSize: 11, color: 'var(--dsw-alias-label-tertiary)' }}>{card.tag}</div>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {CUBES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={preference === id}
            onClick={() => { setTheme(id) }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--dsw-alias-label-primary)',
              background: 'var(--dsw-alias-bg-layer-2)',
              border: preference === id
                ? '1px solid var(--dsw-alias-brand-primary)'
                : '1px solid var(--dsw-alias-border-l1)',
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
