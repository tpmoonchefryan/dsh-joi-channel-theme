/**
 * 换装行的 slot store：插件世界的状态到组件世界的单向镜像。
 *
 * 组件只经由 props.useStore 读，写入口只有插件 apply 里的那一处同步回调。
 * 这条单向性是 slot store 的约定，也是这里不直接把 SuitRuntime 传进组件的原因。
 */
import type { ActionsDecl, BakedActions, StoreHandle } from '@deepseek-ai/dsh-client-ui-slots'
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
 * 内联的 defineStore 兼容层。
 *
 * dsh 0.1.2-alpha 线起，客户端运行时换成 `@deepseek-ai/dsh-client-modules` 的
 * 懒加载模块表，`defineStore` 不再有任何模块表入口（旧包
 * `@deepseek-ai/dsh-client-runtime` 已删除；`@deepseek-ai/dsh-client-store` 只发
 * 类型，不在表的 platform 名单里），所以这里按契约内联一个零依赖等价实现
 * （见 issue #4）。
 *
 * 0.1.7-rc.1 起契约类型改从 `@deepseek-ai/dsh-client-ui-slots` 取（它转出
 * dsh-client-store 的 StoreHandle / StoreInstance / ActionsDecl / BakedActions），
 * 不再有 dsh-client-runtime 这个类型出口；`StoreInstance` 在新契约里只要求
 * actions / getSnapshot / subscribe / clearPersisted——框架侧消费的也是这四样
 * （见 ui-slots 的 StoreInstanceLike），故旧实现里那个多余的原始引擎 store
 * 字段随之删除，persist 路径本包未使用、仍按契约保留。
 */
function defineStoreCompat<S, A extends ActionsDecl<S>>(decl: {
  init: () => S
  persist?: string
  actions: A
}): StoreHandle<S, A> {
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
      }
    },
  }
}

/**
 * 声明换装行的状态与写入面。
 * @returns store 句柄。
 */
export function createSuitRowStore(): StoreHandle<SuitRowState, SuitRowActions> {
  return defineStoreCompat<SuitRowState, SuitRowActions>({
    init: (): SuitRowState => ({ suit: DEFAULT_SKIN, preference: 'system' }),
    actions: {
      sync: (d, suit: Skin, preference: Preference) => {
        d.suit = suit
        d.preference = preference
      },
    },
  })
}
