/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 告诉TypeScript：uno.css是一个合法的模块，不用担心
declare module '*.css'
