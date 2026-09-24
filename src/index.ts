/**
 * 宿主半边。
 *
 * 这是一个纯 UI 插件，宿主侧只做两件真事：导出一份衣装偏好的 Config
 * （设置文档里「衣装」段的取值与校验来源），以及把「本插件自己画设置行」
 * 这件事告诉 settings 服务。浏览器半边通过 ctx.configForms 读写它。
 *
 * apply 不能省成空函数以外的东西：包必须出现在 Loader 的 entries 里，
 * client-modules 才会扫到 package.json 的 dsh.client 声明，
 * 进而把浏览器半边挂进 __DSH_BOOT__ 并在 /plugins/<id>/client.js 供应。
 */
import type { Context } from '@deepseek-ai/cordis'
// 类型侧副作用导入：把 @deepseek-ai/dsh-settings 对 cordis 的模块增强
// （ctx.settings 服务，见其 lib/types/index.d.ts 的 declare module '@deepseek-ai/cordis'）
// 拉进类型图，供下方 apply 的 settingsCtx.settings 使用。构建时擦除，
// 不产生任何运行时 import。
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import { DEFAULT_SKIN, SETTINGS_NAMESPACE, SKINS, SUIT_FIELD, type JoiSettings } from './contract.ts'

export {
  DEFAULT_SKIN, DEFAULT_SUIT, SETTINGS_NAMESPACE, SKINS, SUITS, SUIT_FIELD,
  isSkin, isSuit, type JoiSettings, type Skin, type Suit,
} from './contract.ts'

/**
 * 衣装偏好的持久 schema，同时是浏览器侧校验用的 wire 信封。
 *
 * dsh 0.1.7-rc.1 重写了设置链路：`ctx.settings.register(ns, schema, { base })`
 * 已删除，设置文档改由每个 loader entry **自己导出的 Config** 投影而来。
 * 于是这份 schema 现在必须以 `Config` 具名导出（Loader 读 `runtime.Config`），
 * 且字段要标 `.volatile()`——宿主只把 volatile 字段当作可写表单项服务
 * （`volatileForm`），也只接受落在 volatile 节点下的写路径（`isVolatilePath`）。
 * 漏标的表现是「命名空间在册、字段为空」，读写全部静默失效。
 *
 * 命名空间随之变成 loader entry id：`cordis.patch.yml` 里 insert 的
 * `id: joi-channel-theme` 就是它，与 contract.ts 的 SETTINGS_NAMESPACE 同值。
 * 下方仍校验一次模式，防止两者漂移。
 */
export const Config = z.object({
  [SUIT_FIELD]: z.union([...SKINS]).default(DEFAULT_SKIN).volatile(),
})

/** 历史名（旧版 `register()` 时代的 schema 出口）。 */
export const JoiSettingsSchema: typeof Config = Config

/**
 * 命名空间校验：复刻 rc.6 `settingsNamespace()` 包装器的原始模式
 * （`/^[a-z][a-z0-9-]*$/`），同时确认它与 loader entry id 同值。
 */
const NAMESPACE_PATTERN = /^[a-z][a-z0-9-]*$/
const NAMESPACE = SETTINGS_NAMESPACE
if (!NAMESPACE_PATTERN.test(NAMESPACE)) {
  throw new TypeError(`settings namespace "${NAMESPACE}" must match ${String(NAMESPACE_PATTERN)}`)
}

/**
 * 宿主插件体：把「自己画设置行」的策略交给 settings 服务。
 *
 * `auto: false` —— 设置行由浏览器半边的换装行提供（它遮蔽 ui-theme 的外观行），
 * 不必再自动生成一张插件配置页。第二个参数必须是本插件自己的 fiber：
 * Service 读 ctx 用的是**调用方**的 fiber，缺省会把这条策略记在 inject 的
 * 子作用域上。
 *
 * 用 ctx.inject 而不是直接读服务，是因为 settings 是可选能力——远端浏览器
 * 场景下它可能根本没被组合进来，那时浏览器半边会走进程内兜底
 * （见 client/suit.ts）。缺它不该让插件失败。
 * @param ctx - 宿主上下文。
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber))
  })
}
