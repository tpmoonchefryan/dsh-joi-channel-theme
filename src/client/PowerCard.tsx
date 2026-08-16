/**
 * 设置 → 插件 → 插件配置 里的开关卡。
 *
 * 为什么开关在这里而不是在「换装」行里：装插件不等于同意换肤，
 * 「要不要让这个插件生效」与「选哪套衣装」是两个层级的问题。
 * 前者属于插件治理，后者属于外观偏好——放在一起会让人以为原生也是一套衣装。
 *
 * 关掉不改契约：`native` 本来就是持久字段的一个合法值，这张卡只是同一个
 * SuitRuntime 的第二个操作面，没有新 schema、没有迁移。关掉时记住上一套衣装，
 * 再打开就回到它，而不是粗暴地回到默认。
 */
import type { PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createPowerStore } from './power-store.ts'
import type {} from './slot-contract.ts'

/** 注入的业务面。 */
export interface PowerCardInjected {
  /** 让主题生效或失效。 */
  setEnabled: (on: boolean) => void
}

/** 完整 props。 */
export type PowerCardProps = PropsStore<ReturnType<typeof createPowerStore>> & PowerCardInjected

/**
 * 渲染开关卡。
 * @param props - 合成后的 slot props。
 * @returns 卡片元素树。插件配置页把卡片放进 <ul>，所以根必须是 <li>。
 */
export function PowerCard({ useStore, setEnabled }: PowerCardProps): React.JSX.Element {
  const enabled = useStore(s => s.skin !== 'native')

  return (
    <li
      style={{
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 10,
        background: 'var(--dsw-alias-bg-layer-2)',
        border: '1px solid var(--dsw-alias-border-l1)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: 'var(--dsw-alias-label-primary)' }}>
          轴伊 Joi 双衣装主题
        </div>
        <div style={{ fontSize: 11, color: 'var(--dsw-alias-label-tertiary)', marginTop: 2 }}>
          关掉即回到 DeepSeek 原生外观，插件保持安装
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="启用轴伊 Joi 主题"
        onClick={() => { setEnabled(!enabled) }}
        style={{
          flex: 'none',
          width: 40,
          height: 22,
          padding: 2,
          borderRadius: 999,
          cursor: 'pointer',
          border: '1px solid var(--dsw-alias-border-l2)',
          background: enabled ? 'var(--dsw-alias-button-primary-fill)' : 'var(--dsw-alias-bg-layer-1)',
          display: 'flex',
          justifyContent: enabled ? 'flex-end' : 'flex-start',
        }}
      >
        <span
          style={{
            display: 'block',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: enabled ? '#FFFFFF' : 'var(--dsw-alias-label-tertiary)',
          }}
        />
      </button>
    </li>
  )
}
