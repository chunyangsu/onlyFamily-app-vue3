import {
  defineConfig,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetUni } from '@uni-helper/unocss-preset-uni'
import { presetWot } from '@wot-ui/unocss-preset' // 引入 Wot UI 预设<websource>source_group_web_5</websource>

export default defineConfig({
  presets: [
    presetUni(), // uni-app 小程序适配预设，自动处理 rpx 单位转换和平台兼容性
    presetWot(), // 将 Wot UI 的设计 token 映射为 wot- 前缀的原子类
  ],
  transformers: [
    transformerDirectives(), // 支持在 style 中使用 @apply 指令
    transformerVariantGroup(), // 支持 hover:(bg-blue text-white) 变体组语法
  ],
  envMode: 'build', // 关键配置：强制使用构建模式，避免开发时预检查导致小程序兼容性问题
})
