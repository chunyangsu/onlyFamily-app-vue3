import { createSSRApp } from 'vue'
import App from './App.vue'
// 导入UnoCSS
import 'uno.css'
// 导入pinia实例
import pinia from '@/stores/index'

export function createApp() {
  const app = createSSRApp(App)
  // 使用 Pinia
  app.use(pinia)
  return {
    app
  }
}
