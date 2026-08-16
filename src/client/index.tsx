/**
 * 浏览器半边。轴伊 Joi 双衣装主题。
 *
 * 三件事，边界分明：
 *   ① 颜色 —— 一层 ctx.theme.overrideTokens，明暗双向。官方 API，presenter
 *      负责落到 body 行内样式，插件 dispose 时它自己收回。
 *   ② 设置 —— cell shadowing 把内置外观行换成「换装」行。官方替换路径，
 *      卸载后内置行自动回归。
 *   ③ 装饰 —— 立绘、鲸鱼娘、两个 Q 版角色、底纹、字标手术。这一层没有官方
 *      接缝可用，只能认领 DOM；失败姿态一律是 fail-soft（装饰不出现，
 *      不把原生界面弄坏）。
 *
 * 明暗自始至终归 app：body[data-ds-dark-theme] 是 ui-layout presenter 的私产，
 * 本插件从不写它。
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-ui-slots'
// 仅类型：把 ctx.theme / ctx.settingsScope / ctx.slots 的 Context 合并拉进来。
// 值导入会内联出重复的运行时实例，跨插件协作只能走 cordis 服务。
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { SETTINGS_NAMESPACE, type JoiSettings, type Skin } from '../contract.ts'
import { SuitRuntime } from './suit.ts'
import { Surfaces } from './surfaces.ts'
import { SuitRow, type SuitRowInjected } from './SuitRow.tsx'
import { createSuitRowStore, type Preference } from './suit-row-store.ts'
import { PowerCard, type PowerCardInjected } from './PowerCard.tsx'
import { createPowerStore } from './power-store.ts'
import { installFavicon } from './favicon.ts'

/**
 * 需要的服务。
 * · theme —— token 覆盖层与明暗偏好。
 * · slots —— 换装行的注册位。
 * · settingsScope —— 衣装偏好的持久化通道。
 */
export const inject = ['theme', 'slots', 'settingsScope']

/** 装饰层暴露给回归脚本的读数入口。 */
declare global {
  interface Window {
    /** 四象限回归断言读这里；生产环境留着无害，它只读不写。 */
    __joi?: () => unknown
  }
}

/**
 * 浏览器插件体。
 * @param ctx - 客户端 cordis 上下文。
 */
export function apply(ctx: ClientContext): void {
  // 自有命名空间。不复用 ui-theme 的：它的偏好白名单只认 light/dark/system，
  // 自定义衣装 id 存不进去。远端浏览器没有特权设置 API 时 bind 会给出
  // unavailable 快照，SuitRuntime 退化为进程内偏好——与内置行同款降级。
  const scope = ctx.settingsScope.bind<JoiSettings>({ namespace: SETTINGS_NAMESPACE })

  const suits = new SuitRuntime(ctx.theme, scope)
  suits.start()
  const surfaces = new Surfaces(suits.skin, () => suits.persistence)

  ctx.effect(() => suits.subscribe((skin) => { surfaces.setSuit(skin) }), 'joi-theme: 皮肤 → 装饰层')

  // 🍊 favicon 也归主题：原生态下要把原图标还回去，否则标签页还挂着橘子。
  ctx.effect(() => {
    let undo: (() => void) | undefined = suits.isNative ? undefined : installFavicon()
    const off = suits.subscribe(() => {
      undo?.()
      undo = suits.isNative ? undefined : installFavicon()
    })
    return () => { off(); undo?.() }
  }, 'joi-theme: 🍊 favicon')
  ctx.effect(() => () => { surfaces.dispose() }, 'joi-theme: 装饰层')
  ctx.effect(() => () => { suits.dispose() }, 'joi-theme: token 覆盖层')

  // 设置文档可能在别处被改（多窗口、Host 侧写入）；回读时不再写回去。
  ctx.effect(() => scope.subscribe(() => {
    const stored = scope.getSnapshot().value?.suit
    if (stored !== undefined && stored !== suits.skin) suits.setSuit(stored, false)
  }), 'joi-theme: 设置回读')

  installSuitRow(ctx, suits)
  installPowerCard(ctx, suits)

  // 量测入口。回归脚本用它取几何读数，比截图比对稳定得多。
  window.__joi = () => surfaces.metrics()
  ctx.effect(() => () => { delete window.__joi }, 'joi-theme: 量测入口')
}

/**
 * 在 设置 → 插件 → 插件配置 里放一张开关卡。
 *
 * 与换装行分层：那里回答「选哪套衣装」，这里回答「要不要让这个插件生效」。
 * 后者是插件治理层面的问题，混进外观偏好里会让人以为原生也是一套衣装。
 * 关掉不改持久契约——`native` 本来就是那个字段的合法值。
 * @param ctx - 客户端上下文。
 * @param suits - 皮肤运行时。
 */
function installPowerCard(ctx: ClientContext, suits: SuitRuntime): void {
  const store = createPowerStore()
  let bound: BoundActions<typeof store> | undefined
  const sync = (): void => { bound?.sync(suits.skin) }
  ctx.effect(() => suits.subscribe(sync), 'joi-theme: 开关卡同步')

  const injected = (actions: BoundActions<typeof store>): PowerCardInjected => {
    bound = actions
    sync()
    return { setEnabled: (on: boolean) => { suits.setEnabled(on) } }
  }

  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: 'joi-channel-theme',
    order: 30,
    store,
    inject: injected,
  }, PowerCard))
}

/**
 * 用「换装」行遮蔽内置的「外观」行。
 *
 * 同 slot、同 id、priority −1：一格里最低 priority 的那条渲染，内置那条
 * （priority 默认 0）被遮住但仍在册，本插件卸载后它自动回归。
 * @param ctx - 客户端上下文。
 * @param suits - 衣装运行时。
 */
function installSuitRow(ctx: ClientContext, suits: SuitRuntime): void {
  const store = createSuitRowStore()
  let bound: BoundActions<typeof store> | undefined

  const preference = (): Preference => ctx.theme.getTheme().preference
  const sync = (): void => { bound?.sync(suits.skin, preference()) }

  ctx.on('theme/change', sync)
  ctx.effect(() => suits.subscribe(sync), 'joi-theme: 换装行同步')

  const injected = (actions: BoundActions<typeof store>): SuitRowInjected => {
    bound = actions
    // 从取值器再同步一次：注册到首次渲染之间的事件不会丢。
    sync()
    return {
      setSuit: (skin: Skin) => { suits.setSuit(skin) },
      // 明暗转交给 theme 服务。插件不碰 body 属性——那是 presenter 的私产。
      setTheme: (id: Preference) => { ctx.theme.setTheme(id) },
    }
  }

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'appearance',
    priority: -1,
    order: 10,
    store,
    inject: injected,
  }, SuitRow))
}
