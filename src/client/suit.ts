/**
 * 衣装状态：当前是哪一套、怎么换、怎么记住。
 *
 * 三条约束决定了这里的形状：
 *   · 互斥。两套衣装各是一层 overrideTokens，切换必须「先卸后挂」。
 *     叠加层是按 seq 后来居上逐 token 合并的，两层并存不会得到后一套，
 *     只会得到「后一套盖住了前一套里同名的部分」——也就是混色。
 *   · 明暗不归我们。body[data-ds-dark-theme] 是 ui-layout presenter 的私产，
 *     外部写会被它改回去。衣装只管色相，明暗永远由 app 的外观设置驱动。
 *   · 偏好要能存。ui-theme 的偏好白名单只认 light/dark/system；衣装值走
 *     本插件 ConfigForm，并兼容迁移此前存在 localStorage 的选择。
 */
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
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
 * 历史 localStorage 键。旧版选择会在 Host 表单 ready 且可写时迁移到 ConfigForm；
 * 此键仍作为兼容读取和 Host 表单不可用时的本地兜底。
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
  /** 用户手势优先于已在途的宿主读取。 */
  private userSelected = false
  /** 宿主写入回包前按衣装去重。 */
  private readonly pendingHostWrites = new Set<Skin>()
  private stopWatchingScope: (() => void) | undefined
  /** 关掉主题前那套衣装。再打开时回到它，而不是粗暴地回到默认。 */
  private lastSuit: Suit = DEFAULT_SUIT

  private readonly host: TokenLayerHost
  private readonly scope: ConfigForm<JoiSettings> | undefined

  /**
   * @param host - token 覆盖宿主（生产环境是 ctx.theme）。
   * @param scope - 本插件自有 ConfigForm；不可用时使用浏览器本地偏好。
   */
  constructor(host: TokenLayerHost, scope: ConfigForm<JoiSettings> | undefined) {
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
      // Host 表单 ready 时以宿主设置文档为主；否则使用 localStorage 兜底。
      channel: snap?.status === 'ready' && snap.writable ? 'host' : 'local',
      hostStatus: snap?.status ?? 'unbound',
      stored: this.read(),
    }
  }

  /**
   * 读回持久偏好：宿主原始用户层优先，其次旧 localStorage 键。
   * ConfigForm.value 已应用 schema 默认值，不能用它判断用户是否明确选择。
   * @returns 存着的衣装，没有则 undefined。
   */
  private read(): Skin | undefined {
    const fromHost = this.explicitHostSuit()
    if (fromHost !== undefined) return fromHost
    return this.readLegacy()
  }

  /**
   * ConfigForm.value 已应用 schema 默认值，只有原始 user 层的字段存在性
   * 能证明是宿主显式选择（即使值恰好等于默认值也一样）。
   */
  private explicitHostSuit(): Skin | undefined {
    const snapshot = this.scope?.getSnapshot()
    if (snapshot?.status !== 'ready') return undefined
    const user = snapshot.user
    if (typeof user !== 'object' || user === null || Array.isArray(user)) return undefined
    const suit = Reflect.get(user, SUIT_FIELD)
    return isSkin(suit) ? suit : undefined
  }

  /** @returns 旧版保存在 localStorage 中的合法衣装值。 */
  private readLegacy(): Skin | undefined {
    try {
      const local = globalThis.localStorage?.getItem(LOCAL_KEY)
      if (isSkin(local)) return local
    } catch {
      // 隐私模式 / 禁用存储：读不到就当没存过，不是错误。
    }
    return undefined
  }

  /**
   * 读回持久偏好并挂上对应衣装；无宿主/旧值时用默认衣装。
   */
  start(): void {
    const stored = this.read()
    if (stored !== undefined) {
      this.current = stored
      this.chosen = true
      if (stored !== 'native') this.lastSuit = stored
    }
    this.mount()
    this.stopWatchingScope?.()
    this.stopWatchingScope = this.scope?.subscribe(() => this.syncFromHost())
    // ConfigForms 可能已在本插件启动前完成首读。
    this.syncFromHost()
  }

  /**
   * 合并一次宿主快照，不把 schema 默认值当成用户选择。
   * 宿主表单可写时，把旧 localStorage 偏好迁移到新表单。
   */
  private syncFromHost(): void {
    const snapshot = this.scope?.getSnapshot()
    if (snapshot?.status !== 'ready') return

    const explicit = this.explicitHostSuit()
    if (this.userSelected) {
      // 用户可能在宿主首读尚未完成时操作；保留新意图，并在表单可写后回写。
      if (explicit !== this.current) this.writeHost(this.current)
      return
    }

    if (explicit !== undefined) {
      if (explicit !== this.current) this.setSuit(explicit, false)
      return
    }

    const legacy = this.readLegacy()
    if (legacy !== undefined) {
      if (legacy !== this.current) this.setSuit(legacy, false)
      this.writeHost(legacy)
    }
  }

  /**
   * 换一套衣装。相同值的内部回读不重挂或通知；用户明确选择仍会持久化。
   * @param suit - 目标衣装。
   * @param persist - 是否写回设置文档；来自设置文档的回读要传 false。
   */
  setSuit(suit: Skin, persist = true): void {
    if (persist) {
      this.userSelected = true
      this.chosen = true
    }

    if (suit === this.current && (this.chosen || !persist)) {
      if (persist) this.write(suit)
      return
    }

    if (this.current !== 'native') this.lastSuit = this.current
    this.current = suit
    // 先卸后挂：同 source 的 overrideTokens 本身就会替换旧层，
    // 但显式卸载让「任意时刻至多一层」在代码里看得见，而不是靠实现细节兜着。
    this.mount()
    if (persist) {
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
    this.stopWatchingScope?.()
    this.stopWatchingScope = undefined
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

  private writeHost(suit: Skin): void {
    const snapshot = this.scope?.getSnapshot()
    if (!this.scope || snapshot?.status !== 'ready' || !snapshot.writable || this.pendingHostWrites.has(suit)) return
    this.pendingHostWrites.add(suit)
    void this.scope.set(SUIT_FIELD, suit)
      .catch(() => {})
      .finally(() => { this.pendingHostWrites.delete(suit) })
  }

  private write(suit: Skin): void {
    this.writeHost(suit)
    // 每次明确选择也同步旧键，作为宿主表单不可用时的 origin-local 兜底。
    try {
      globalThis.localStorage?.setItem(LOCAL_KEY, suit)
    } catch {
      // 存储可能被禁用；此时由宿主表单或当前进程保留选择。
    }
  }
}
