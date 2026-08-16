/**
 * `settings.plugin.item` 的本地类型副本。
 *
 * 正本在 harness 的 ui-settings-plugins/src/client/slot-contract.ts。那个包没进
 * 本项目的依赖（它只提供卡片外壳，而本卡自绘），所以在这里补一份同形声明。
 * 一旦该包进了 devDependencies，删掉本文件改用 type-only import——
 * 两份同名声明并存会撞 TS2717。
 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /** 插件配置页里的一张卡。 */
    'settings.plugin.item': {
      kind: 'list'
      scope: 'root'
      owner: { children?: never }
    }
  }
}

export {}
