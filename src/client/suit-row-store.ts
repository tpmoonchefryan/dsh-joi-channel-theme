/**
 * 换装行的 slot store：插件世界的状态到组件世界的单向镜像。
 *
 * 组件只经由 props.useStore 读，写入口只有插件 apply 里的那一处同步回调。
 * 这条单向性是 slot store 的约定，也是这里不直接把 SuitRuntime 传进组件的原因。
 */
import type { EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import { DEFAULT_SKIN, type Skin } from '../contract.ts'

/** app 的内置明暗偏好。 */
export type Preference = 'light' | 'dark' | 'system'

/** 换装行的状态。 */
export interface SuitRowState {
  /** 当前皮肤（含 native）。 */
  suit: Skin
  /** 当前明暗偏好（读的是持久偏好，不是解析后的活动主题）。 */
  preference: Preference
}

/** 写入面。 */
type SuitRowActions = {
  sync: (draft: SuitRowState, suit: Skin, preference: Preference) => void
}

/**
 * alpha 兼容层：dsh 0.1.2-alpha 线把客户端运行时整体换成
 * `@deepseek-ai/dsh-client-modules` 的懒加载模块表，旧包
 * `@deepseek-ai/dsh-client-runtime` 已不在产物与模块表中——bundle 若仍
 * `require("@deepseek-ai/dsh-client-runtime/client")`，物化时会抛
 * 「client-modules: … missed the module table」让整个 boot/热载失败
 * （见 issue #4）。本包对 runtime 的唯一**值**依赖就是 defineStore，
 * 故按 rc.6 的 StoreHandle / StoreInstance 契约内联一个零依赖等价实现；
 * persist 路径本包未使用，仍按契约保留。类型导入（type-only）构建时擦除，
 * 不产生 require，可保留原样。
 */
type ActionsDecl<S> = Record<string, (draft: S, ...params: any[]) => void>

/** BakedActions：把声明的 draft 参数烘焙掉（与 ui-slots 契约一致）。 */
type BakedActions<S, A extends ActionsDecl<S>> = {
  [K in keyof A]: A[K] extends (draft: S, ...params: infer P) => void ? (...params: P) => void : never
}

function defineStoreCompat<S, A extends ActionsDecl<S>>(decl: {
  init: () => S
  persist?: string
  actions: A
}): EngineStoreHandle<S, A> {
  return {
    spec: decl,
    create(scopeKey?: string) {
      const persistKey = decl.persist === undefined ? undefined
        : scopeKey === undefined ? decl.persist : `${decl.persist}.${scopeKey}`
      let state = decl.init()
      const listeners = new Set<() => void>()
      const notify = () => {
        for (const fn of [...listeners]) fn()
      }
      const produce = (current: S, mutate: (draft: S) => void): S => {
        const draft = (typeof structuredClone === 'function'
          ? structuredClone(current)
          : JSON.parse(JSON.stringify(current))) as S
        mutate(draft)
        return draft
      }
      const update = (mutator: (draft: S) => void): void => {
        state = produce(state, mutator)
        notify()
      }
      const set = (next: S): void => {
        state = next
        notify()
      }
      const getSnapshot = (): S => state
      const subscribe = (fn: () => void): (() => void) => {
        listeners.add(fn)
        return () => {
          listeners.delete(fn)
        }
      }
      const baked = {} as Record<string, (...params: any[]) => void>
      for (const key of Object.keys(decl.actions) as (keyof A)[]) {
        const mutate = decl.actions[key]!
        baked[key as string] = (...params: any[]) => {
          update((draft) => mutate(draft, ...params))
        }
      }
      return {
        actions: baked as unknown as BakedActions<S, A>,
        getSnapshot,
        subscribe,
        clearPersisted: () => {
          if (persistKey === undefined || typeof localStorage === 'undefined') return
          try {
            localStorage.removeItem(persistKey)
          } catch {}
        },
        // EngineStoreInstance 契约要求的原始引擎 store（框架/测试 API）。
        store: { getSnapshot, subscribe, update, set },
      }
    },
  }
}

/**
 * 声明换装行的状态与写入面。
 * @returns store 句柄。
 */
export function createSuitRowStore(): EngineStoreHandle<SuitRowState, SuitRowActions> {
  return defineStoreCompat({
    init: (): SuitRowState => ({ suit: DEFAULT_SKIN, preference: 'system' }),
    actions: {
      sync: (d, suit: Skin, preference: Preference) => {
        d.suit = suit
        d.preference = preference
      },
    },
  })
}
