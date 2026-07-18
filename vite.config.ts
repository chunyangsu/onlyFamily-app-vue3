import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// 引入自动导入插件
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // 使用 await import 动态引入 UnoCSS
  const UnoCSS = (await import('unocss/vite')).default

  return {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler', // 使用新版 Sass API，消除 legacy-js-api 警告
          silenceDeprecations: ['legacy-js-api'], // 静默该特定警告
        },
      },
    },
    optimizeDeps: {
      exclude: ['@wot-ui/ui'], // 关键：防止 Vite 预构建破坏样式
    },
    plugins: [
      // uni-app 插件
      uni(),
      // 配置 UnoCSS
      UnoCSS({
        mode: 'per-module', // 关键配置：让 UnoCSS 为每个组件生成独立样式，实现样式隔离
      }),
      // 配置自动导入插件
      AutoImport({
        imports: ['vue', 'uni-app'], // 自动导入 Vue 和 UniApp 的 API
        dts: 'src/types/auto-imports.d.ts', // 自动生成类型声明文件
        eslintrc: {
          enabled: true, // 生成 ESLint 配置文件
          filepath: './.eslintrc-auto-import.json', // ESLint 配置文件路径
        },
      }),
    ],
  }
})
