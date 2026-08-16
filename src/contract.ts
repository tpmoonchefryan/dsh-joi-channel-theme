/**
 * 两个半边共享的常量与类型。零依赖是刻意的：客户端 bundle 会把这个文件内联，
 * 而宿主半边要用的 schemastery / dsh-settings 都是 Node 侧依赖，
 * 一旦从这里泄进浏览器产物，模块表答不上那个 require，启动即抛。
 */

/** 两套衣装。互斥，不得混用（设计法条）。 */
export const SUITS = ['flowers', 'library'] as const

/** 衣装标识。 */
export type Suit = typeof SUITS[number]

/**
 * 可选的三种皮肤：两套衣装，外加「原生」。
 *
 * 原生是一等选项，不是降级：装了插件不等于必须换肤。选它时 token 覆盖层
 * 整层卸掉、装饰层静默，界面回到与未装插件逐项一致的样子。
 */
export const SKINS = [...SUITS, 'native'] as const

/** 皮肤标识。 */
export type Skin = typeof SKINS[number]

/** 首装默认皮肤。 */
export const DEFAULT_SKIN: Skin = 'flowers'

/** 首装默认衣装（原生态下装饰层仍以此为素材基准）。 */
export const DEFAULT_SUIT: Suit = 'flowers'

/**
 * 窄化一个跨设置边界的值。
 * @param value - 来自设置文档或 UI 的值。
 * @returns 是否为合法皮肤标识。
 */
export function isSkin(value: unknown): value is Skin {
  return SKINS.some(skin => skin === value)
}

/**
 * 本插件自有的设置命名空间。
 *
 * 不复用 ui-theme 的命名空间，也不走 register()+setTheme() 当持久化路径：
 * ThemeRuntime 的 isThemePreference 白名单只认 light/dark/system，
 * 任何自定义 id 都存不进它的偏好字段（源码实证）。明暗归 app，衣装归这里。
 */
export const SETTINGS_NAMESPACE = 'joi-channel-theme'

/** 承载衣装选择的字段名。 */
export const SUIT_FIELD = 'suit'

/** 本命名空间的持久段。 */
export interface JoiSettings {
  /** 用户选中的皮肤（两套衣装或原生）。 */
  suit: Skin
}

/**
 * 窄化一个跨设置边界的值。
 * @param value - 来自设置文档或 UI 的值。
 * @returns 是否为合法衣装标识。
 */
export function isSuit(value: unknown): value is Suit {
  return SUITS.some(suit => suit === value)
}
