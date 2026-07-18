// // eslint.config.mts
import js from "@eslint/js";
import globals from "globals"; // 全局变量配置
import tseslint from "typescript-eslint"; // typescript配置
import { defineConfig } from "eslint/config";
// ESLint 核心插件
import pluginVue from "eslint-plugin-vue"; // vue配置
import pluginTypeScript from "@typescript-eslint/eslint-plugin";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

// Prettier 插件及配置

// 解析器
import * as parserVue from "vue-eslint-parser"; // 导入 Vue 解析器
import * as parserTypeScript from "@typescript-eslint/parser"; // 导入 TS 解析器

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], // 校验的文件类型
    plugins: { js },
    extends: ["js/recommended"],
    // 设置浏览器环境的全局变量
    languageOptions: { globals: globals.browser },
    // 在这里配置自定义rules
    rules: {
      // ============== ESLint通用规则 ==============
      indent: ["error", 2], // 使用两个空格进行缩进
      "no-trailing-spaces": "error", // 不允许行尾有空格
      eqeqeq: "error", // 要求使用 === 和 !==
      semi: ["error", "never"], // 不要分号
      "no-extra-parens": "error", // 禁止不必要的括号
      "no-multi-str": "error", // 禁止出现多行字符串，可以使用模板字符串换行
      "no-multi-spaces": "error", // 禁止出现多个空格，如===前后可以有一个空格，但是不能有多个空格
      "semi-spacing": "error", // 强制分号后面有空格，如for (let i=0; i<20; i++)
      "block-spacing": "error", // 强制函数/循环等块级作用域中的花括号内前后有一个空格（对象除外）
      "brace-style": ["error", "1tbs", { allowSingleLine: true }], // if/elseif/else左花括号要跟if..同行，右花括号要换行；或者全部同一行
      "func-call-spacing": "error", // 禁止函数名和括号之间有个空格
      "jsx-quotes": "error", // 强制在jsx中使用双引号
      "key-spacing": "error", // 强制对象键值冒号后面有一个空格
      "no-multiple-empty-lines": "error", // 限制最多出现两个空行
      "nonblock-statement-body-position": "error", // 强制单行语句不换行
      "object-curly-spacing": ["error", "always"], // 强制对象/解构赋值/import等花括号前后有空格
      "space-before-blocks": "error", // 强制块（for循环/if/函数等）前面有一个空格，如for(...){}是错的，花括号前面要空格：for(...) {}
      "space-infix-ops": "error", // 强制操作符（+-/*）前后有一个空格
      "spaced-comment": "error", // 强制注释（//或/*）后面要有一个空格
      "arrow-parens": ["error", "as-needed"], // 箭头函数参数只有一个时，不允许写圆括号
      "arrow-spacing": "error", // 要求箭头函数的=>前后有空格
      "no-duplicate-imports": "error", // 禁止重复导入
      "no-else-return": "error", // 如果if语句里面有return，后面不能跟else语句
      // ============== typeScript规则 ==============
      "@typescript-eslint/no-explicit-any": "off", // 关闭any类型的警告
      "@typescript-eslint/explicit-function-return-type": "off", // 不强制要求函数必须明确返回类型
      "@typescript-eslint/no-empty-interface": "off", // 禁用 no-empty-interface 规则，允许空接口声明
      "@typescript-eslint/no-empty-object-type": "off", // 允许空对象类型
      "@typescript-eslint/no-empty-function": "off", // 关闭空方法检查
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      // ============== vue规则 ==============
      "vue/multi-word-component-names": "off", // 关闭多单词组件名称的限制
      "vue/no-v-model-argument": "off",
      "vue/html-indent": ["error", 2], // Vue 模板中的 HTML 缩进使用两个空格
      "vue/script-setup-uses-vars": "error",
      "vue/no-reserved-component-names": "off",
      "vue/custom-event-name-casing": "off",
      "vue/attributes-order": "off",
      "vue/one-component-per-file": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/max-attributes-per-line": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/attribute-hyphenation": "off",
      "vue/require-default-prop": "off",
      "vue/require-explicit-emits": "off",
      // 没有子级内容时标签自闭合
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always", // void元素
            normal: "always", // 除了void元素之外的其他html元素
            component: "always", // 自定义组件
          },
          svg: "always",
          math: "always",
        },
      ],
    },
    // eslint不能对html文件生效
    // overrides: [
    //   {
    //     files: ['*.html'],
    //     processor: 'vue/.vue',
    //   },
    // ],
  },
  // typescript推荐配置
  tseslint.configs.recommended,
  // vue推荐配置
  pluginVue.configs["flat/essential"],
  // 对vue文件使用typescript解析器
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },

  // 添加忽略的文件或目录
  // {
  //   ignores: [
  //     '/dist',
  //     '/public',
  //     '/node_modules',
  //     '**/*.min.js',
  //     '**/*.config.mjs',
  //     '**/*.tsbuildinfo',
  //     '/src/manifest.json',
  //   ],
  // },
  // 将 prettier 推荐配置放在数组的最底部，以覆盖冲突的规则
  eslintPluginPrettierRecommended,
]);
