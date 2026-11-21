import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig } from 'eslint/config'
import pluginVue from 'eslint-plugin-vue'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import autoImportConfig from './.eslintrc-auto-import.json'

export default defineConfig([
  // 1. 基础推荐配置放在前面，项目规则在后面统一覆盖。
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: { js },
    extends: ['js/recommended']
  },
  tseslint.configs.recommended,
  pluginVue.configs['flat/essential'],

  // 2. Vue 单文件组件中的脚本使用 TypeScript 解析器。
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } }
  },

  // 3. 缩进、引号、分号等格式统一交给 Prettier，关闭冲突的 ESLint 规则。
  eslintPluginPrettierRecommended,

  // 4. 项目配置放在推荐配置之后，避免自定义规则被覆盖。
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    // 统一注册 Vue 插件，合并后的 Vue 规则也能在 JS/TS 文件配置中解析。
    plugins: { vue: pluginVue },
    // 合并浏览器、自动导入和 uni-app 运行时提供的全局变量。
    languageOptions: {
      globals: {
        ...globals.browser,
        ...autoImportConfig.globals,
        uni: 'readonly',
        getCurrentPages: 'readonly'
      }
    },
    rules: {
      // 通用代码检查，不在这里重新启用与 Prettier 冲突的格式规则。
      eqeqeq: 'error', // 要求使用 === 和 !==
      'no-multi-str': 'error', // 多行字符串使用模板字符串
      'no-duplicate-imports': 'error', // 禁止重复导入
      'no-else-return': 'error', // return 后不再使用 else

      // TypeScript 项目规则。
      '@typescript-eslint/no-unused-vars': 'warn', // 未使用的导入、变量和参数仅提示警告
      '@typescript-eslint/no-explicit-any': 'off', // 允许 any 类型
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off', // 允许空对象类型
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // Vue 项目规则。
      'vue/multi-word-component-names': 'off', // 允许 index.vue 等单词组件名
      'vue/no-v-model-argument': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/custom-event-name-casing': 'off',
      'vue/attributes-order': 'off',
      'vue/one-component-per-file': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-explicit-emits': 'off',
      // 有意放在 Prettier 配置之后，保留空标签自动自闭合。
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always'
          },
          svg: 'always',
          math: 'always'
        }
      ]
    }
  }
])
