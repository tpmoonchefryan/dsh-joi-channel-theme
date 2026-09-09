/**
 * 宿主半边。
 *
 * 这是一个纯 UI 插件，宿主侧只做一件真事：注册衣装偏好的设置命名空间，
 * 好让浏览器半边的 ctx.settingsScope.bind 有东西可绑、选择能落到
 * $DSH_HOME 的用户设置文档里。除此之外宿主不参与渲染。
 *
 * apply 不能省成空函数以外的东西：包必须出现在 Loader 的 entries 里，
 * client-modules 才会扫到 package.json 的 dsh.client 声明，
 * 进而把浏览器半边挂进 __DSH_BOOT__ 并在 /plugins/<id>/client.js 供应。
 */
import type { Context } from '@deepseek-ai/cordis'
// 类型侧副作用导入：把 @deepseek-ai/dsh-settings 对 cordis 的模块增强
// （ctx.settings 服务，见其 lib/types/index.d.ts 的 declare module '@deepseek-ai/cordis'）
// 拉进类型图，供下方 apply 的 settingsCtx.settings 使用。构建时擦除，
// 不产生任何运行时 import —— dsh 0.1.2-alpha 线已删除 settingsNamespace 等
// 具名导出，运行时不再依赖该包。
import type {} from '@deepseek-ai/dsh-settings'
import type { SettingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import { DEFAULT_SKIN, SETTINGS_NAMESPACE, SKINS, SUIT_FIELD, type JoiSettings } from './contract.ts'

export {
  DEFAULT_SKIN, DEFAULT_SUIT, SETTINGS_NAMESPACE, SKINS, SUITS, SUIT_FIELD,
  isSkin, isSuit, type JoiSettings, type Skin, type Suit,
} from './contract.ts'

/** 衣装偏好的持久 schema，同时是浏览器侧校验用的 wire 信封。 */
export const JoiSettingsSchema: z<JoiSettings> = z.object({
  [SUIT_FIELD]: z.union([...SKINS]).default(DEFAULT_SKIN),
})

/**
 * 命名空间校验：复刻 rc.6 `settingsNamespace()` 包装器的原始模式
 * （`/^[a-z][a-z0-9-]*$/`），行为与旧版一致，但不依赖已删除的导出。
 */
const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*$/
const NAMESPACE = SETTINGS_NAMESPACE as SettingsNamespace
if (!NAMESPACE_PATTERN.test(NAMESPACE)) {
  throw new TypeError(`settings namespace "${NAMESPACE}" must match ${String(NAMESPACE_PATTERN)}`)
}

/**
 * 宿主插件体：设置服务在场时注册衣装段。
 *
 * 用 ctx.inject 而不是直接读服务，是因为 settings 是可选能力——
 * 远端浏览器场景下它可能根本没被组合进来，那时浏览器半边会走进程内兜底
 * （见 client/suit.ts）。缺它不该让插件失败。
 * @param ctx - 宿主上下文。
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(NAMESPACE, JoiSettingsSchema)
  })
}
