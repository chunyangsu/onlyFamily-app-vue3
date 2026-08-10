// src/types/env.d.ts
interface ImportMetaEnv {
  /**
   * 应用端口
   */
  VITE_APP_PORT: number
  /**
   * API 基础路径
   */
  VITE_APP_BASE_API: string
  /**
   * API 服务器的 URL
   */
  VITE_APP_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 解决 import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' 的ts错误
declare module 'pinia-plugin-persistedstate' {
  import type { PiniaPlugin } from 'pinia'
  const piniaPluginPersistedstate: PiniaPlugin
  export default piniaPluginPersistedstate
}
