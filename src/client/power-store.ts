/**
 * 开关卡的 slot store。与换装行同构：插件世界写、组件世界只读。
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import { DEFAULT_SKIN, type Skin } from '../contract.ts'

/** 开关卡的状态。 */
export interface PowerState {
  /** 当前皮肤；`native` 即「已关闭」。 */
  skin: Skin
}

/** 写入面。 */
type PowerActions = {
  sync: (draft: PowerState, skin: Skin) => void
}

/**
 * 声明开关卡的状态与写入面。
 * @returns store 句柄。
 */
export function createPowerStore(): EngineStoreHandle<PowerState, PowerActions> {
  return defineStore({
    init: (): PowerState => ({ skin: DEFAULT_SKIN }),
    actions: { sync: (d, skin: Skin) => { d.skin = skin } },
  })
}
