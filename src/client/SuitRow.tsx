/**
 * 「换装」设置行 —— 遮蔽内置的「外观」行。
 *
 * 走 cell shadowing：同 slot、同 id 'appearance'、priority 低于内置的 0。
 * 这是 ui-slots 文档化的替换路径（同一格里最低 priority 的那条渲染），
 * 所以不用 fork ui-theme，插件卸载后内置行自动回归。
 *
 * 两层结构：
 *   上 = 两张衣装卡（三色缩览 + 性格标签 + 选中金边）
 *   下 = 原生的明暗三方块，原样保留
 * 明暗永远归 app —— 衣装换的是色相，不是明暗。
 *
 * 「换装」这个词是银翼杀手 Joi 元叙事唯一落到产品文案的地方。副题
 * 「选一套衣装，房间会跟着换」把 token 覆盖这件事翻译成用户能懂的因果。
 */
import {
  IconDarkOutline16, IconFollowsystemOutline16, IconLightOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import { PALETTE } from '../generated/baseline.ts'
import { SUITS, type Skin, type Suit } from '../contract.ts'
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
 * 两张衣装卡的文案。性格标签是设计稿里两套衣装的人格总结。
 *
 * 这里不放「原生」：那是「要不要让插件生效」，属于插件治理，
 * 归 设置 → 插件 → 插件配置 的开关卡（见 PowerCard）。
 * 混在一起会让人以为原生也是一套衣装。
 */
const SUIT_CARDS: Record<Suit, { name: string, tag: string }> = {
  flowers: { name: 'Joi · Flowers', tag: '暖 · 舞台 · 陪伴' },
  library: { name: 'Joi · Library', tag: '冷 · 整理 · 专注' },
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
          选一套衣装，房间会跟着换
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {SUITS.map((id) => {
          const selected = suit === id
          const card = SUIT_CARDS[id]
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
                {SWATCH.map(slot => (
                  <span
                    key={slot}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      background: PALETTE[id].light[slot],
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
