/**
 * 衣装状态：当前是哪一套、怎么换、怎么记住。
 *
 * 三条约束决定了这里的形状：
 *   · 互斥。两套衣装各是一层 overrideTokens，切换必须「先卸后挂」。
 *     叠加层是按 seq 后来居上逐 token 合并的，两层并存不会得到后一套，
 *     只会得到「后一套盖住了前一套里同名的部分」——也就是混色。
 *   · 明暗不归我们。body[data-ds-dark-theme] 是 ui-layout presenter 的私产，
 *     外部写会被它改回去。衣装只管色相，明暗永远由 app 的外观设置驱动。
 *   · 偏好要能存。ui-theme 的偏好白名单只认 light/dark/system，
 *     自定义 id 存不进去，所以走本插件自有的设置命名空间。
 */
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'
import { DEFAULT_SKIN, DEFAULT_SUIT, SUIT_FIELD, isSkin, type JoiSettings, type Skin, type Suit } from '../contract.ts'
import { tokensFor, type TokenOverrides } from './tokens.ts'

/** 挂载/卸载一层 token 覆盖的最小面，便于测试替身。 */
export interface TokenLayerHost {
  /**
   * 挂一层覆盖。
   * @param source - 层标识（同名后挂会替换前一层）。
   * @param tokens - 覆盖表。
   * @returns 卸载该层的 disposer。
   */
  overrideTokens(source: string, tokens: TokenOverrides): () => void
}

/** 覆盖层标识。两套衣装共用同一个 source，保证任意时刻至多一层。 */
const LAYER = 'dsh-joi-channel-theme'

/**
 * 本地兜底存放键。
 *
 * 为什么需要兜底：宿主 apiproxy 里有一份硬编码的命名空间白名单
 * （WEB_SETTINGS_NAMESPACES / PRODUCT_SETTINGS_NAMESPACES），`settings.describe`
 * 只把名单内的段发给浏览器。源码注释写得很明白——「settings 接缝保持通用；
 * 未来的注册不会默认变成远端可读写」。也就是说第三方插件的设置段**按设计**
 * 到不了浏览器：宿主侧 register 成功，浏览器侧拿到的却是 unavailable。
 *
 * 于是走两级：官方通道优先（名单若将来放开，或本插件被收编，就自动用上），
 * 拿不到就落 localStorage。localStorage 同样满足「过刷新与重启仍在」，
 * 代价是它绑在浏览器 origin 上，不进 $DSH_HOME/settings.yaml，
 * 换浏览器或换机器不跟随——这条限制照实记在 README 的已知限制里。
 */
const LOCAL_KEY = 'dsh-joi-channel-theme.suit'

/** 衣装变化的订阅者。 */
export type SuitListener = (skin: Skin) => void

/**
 * 衣装运行时：持有当前衣装、唯一的 token 层，以及偏好读写。
 */
export class SuitRuntime {
  private current: Skin = DEFAULT_SKIN
  private detach: (() => void) | undefined
  private readonly listeners = new Set<SuitListener>()
  /** 用户是否已明确选过。未选过就不写盘——首装不该在设置文档里留痕。 */
  private chosen = false
  /** 关掉主题前那套衣装。再打开时回到它，而不是粗暴地回到默认。 */
  private lastSuit: Suit = DEFAULT_SUIT

  private readonly host: TokenLayerHost
  private readonly scope: SettingsScope<JoiSettings> | undefined

  /**
   * @param host - token 覆盖宿主（生产环境是 ctx.theme）。
   * @param scope - 本插件自有设置命名空间的句柄；不可用时退化为进程内偏好。
   */
  constructor(host: TokenLayerHost, scope: SettingsScope<JoiSettings> | undefined) {
    this.host = host
    this.scope = scope
  }

  /** @returns 当前皮肤（含 native）。 */
  get skin(): Skin {
    return this.current
  }

  /**
   * @returns 装饰层该用哪套衣装的素材。原生态下没有"当前衣装"可言，
   *          返回默认套只是给素材一个基准——原生态下装饰层本就不出图。
   */
  get suit(): Suit {
    return this.current === 'native' ? DEFAULT_SUIT : this.current
  }

  /** @returns 是否处于原生态（不着色、不装饰）。 */
  get isNative(): boolean {
    return this.current === 'native'
  }

  /**
   * 总开关。关 = 切到原生；开 = 回到关掉前那套衣装。
   * @param on - 是否让主题生效。
   */
  setEnabled(on: boolean): void {
    this.setSuit(on ? this.lastSuit : 'native')
  }

  /**
   * @returns 持久化通道的实况。`unavailable` / `memory` 表示这台机器上
   *          衣装偏好只在进程内有效——这是降级而不是故障，但必须能看见，
   *          否则「选了却没记住」会被当成随机 bug 反复排查。
   */
  get persistence(): { channel: string, hostStatus: string, stored: unknown } {
    const snap = this.scope?.getSnapshot()
    return {
      // 实际生效的通道：host = 官方设置文档；local = localStorage 兜底。
      channel: snap?.status === 'ready' ? 'host' : 'local',
      hostStatus: snap?.status ?? 'unbound',
      stored: this.read(),
    }
  }

  /**
   * 读回持久偏好：官方通道优先，其次本地兜底。
   * @returns 存着的衣装，没有则 undefined。
   */
  private read(): Skin | undefined {
    const fromHost = this.scope?.getSnapshot().value?.[SUIT_FIELD]
    if (isSkin(fromHost)) return fromHost
    try {
      const local = globalThis.localStorage?.getItem(LOCAL_KEY)
      if (isSkin(local)) return local
    } catch {
      // 隐私模式 / 禁用存储：读不到就当没存过，不是错误。
    }
    return undefined
  }

  /**
   * 写入持久偏好。两条通道都尝试：官方通道若可用就走它，
   * 本地兜底无论如何都写——名单放开与否不该改变用户看到的行为。
   * @param suit - 要记住的衣装。
   */
  private write(suit: Skin): void {
    // 写失败不回滚界面：用户已经看见换装生效了，把它撤回去更费解。
    // 设置层自己有重试与回读恢复，这里只需要不让 rejection 逃逸。
    if (this.scope?.getSnapshot().status === 'ready') {
      void this.scope.set(SUIT_FIELD, suit).catch(() => {})
    }
    try {
      globalThis.localStorage?.setItem(LOCAL_KEY, suit)
    } catch {
      // 写不进去就只在本进程有效，与内置行在 memory 模式下的降级同义。
    }
  }

  /**
   * 读回持久偏好并挂上对应衣装。设置不可用时用默认衣装，
   * 这与内置外观行在 memory 模式下的降级语义一致。
   */
  start(): void {
    const stored = this.read()
    if (stored !== undefined) {
      this.current = stored
      this.chosen = true
      if (stored !== 'native') this.lastSuit = stored
    }
    this.mount()
  }

  /**
   * 换一套衣装。同一套重复调用是空操作（不重挂、不写盘、不通知）。
   * @param suit - 目标衣装。
   * @param persist - 是否写回设置文档；来自设置文档的回读要传 false。
   */
  setSuit(suit: Skin, persist = true): void {
    if (suit === this.current && (this.chosen || !persist)) return
    if (this.current !== 'native') this.lastSuit = this.current
    this.current = suit
    // 先卸后挂：同 source 的 overrideTokens 本身就会替换旧层，
    // 但显式卸载让「任意时刻至多一层」在代码里看得见，而不是靠实现细节兜着。
    this.mount()
    if (persist) {
      this.chosen = true
      this.write(suit)
    }
    for (const listener of this.listeners) listener(suit)
  }

  /**
   * 订阅衣装变化。
   * @param listener - 变化后调用。
   * @returns 取消订阅的 disposer。
   */
  subscribe(listener: SuitListener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** 卸载 token 层并清空订阅。disposer 幂等（HMR 下会被重复调用）。 */
  dispose(): void {
    this.detach?.()
    this.detach = undefined
    this.listeners.clear()
  }

  /**
   * 卸掉旧层再挂新层。原生态只卸不挂。
   *
   * 只卸就够了：overrideTokens 的 disposer 精确回收它自己那一层，
   * 而内置 light/dark 的 tokens 是空对象，层没了就落回 app 原生取值。
   */
  private mount(): void {
    this.detach?.()
    this.detach = undefined
    if (this.current === 'native') return
    this.detach = this.host.overrideTokens(LAYER, tokensFor(this.current))
  }
}
