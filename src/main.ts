import { createSSRApp } from 'vue'
import App from './App.vue'
// 导入UnoCSS
import 'uno.css'
// 导入pinia实例
import pinia from '@/stores/index'
// 引入scss样式文件
import '@/styles/index.scss'

export function createApp() {
  const app = createSSRApp(App)
  // 使用 Pinia
  app.use(pinia)
  return {
    app
  }
}
