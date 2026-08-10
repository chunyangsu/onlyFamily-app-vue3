import 'pinia'

/**
 * pinia-plugin-persistedstate v2 类型增强
 * 为 Pinia 的 defineStore 第三参数添加 persist 属性类型支持
 */
interface PersistedStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

interface PersistenceOptions {
  /** 持久化存储的 key */
  key?: string
  /** 自定义存储引擎（默认 localStorage，小程序需替换为 uni.getStorageSync / uni.setStorageSync） */
  storage?: PersistedStorage
  /** 指定需要持久化的状态路径 */
  paths?: string[]
}

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistenceOptions | PersistenceOptions[]
  }
}
