import { createSSRApp } from 'vue'
import App from './App.vue'
// 引入UnoCSS
import 'uno.css'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app,
  }
}
