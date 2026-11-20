const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

const page = readFileSync(resolve(__dirname, '../src/components/su/SuInputNumber/index.vue'), 'utf8')
const source = page.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]

test('数字输入框单向绑定只读显示值，通过 input 更新模型', () => {
  assert.match(page, /:model-value="inputValue"/)
  assert.doesNotMatch(page, /v-model="inputValue"/)
  const model = { value: '' }
  const module = { exports: {} }
  vm.runInNewContext(ts.transpileModule(source + '\nexports.api = { handleInput, handleBlur, inputValue };', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText, {
    module,
    exports: module.exports,
    defineProps: () => ({}),
    withDefaults: (props, defaults) => ({ ...defaults, ...props }),
    defineModel: () => model,
    computed: get => ({ get value() { return get() } })
  })
  const api = module.exports.api
  api.handleInput({ value: '0012.345' })
  assert.equal(model.value, '12.34')
  assert.equal(api.inputValue.value, '12.34')
  api.handleInput({ value: '1.2' })
  api.handleBlur()
  assert.equal(model.value, '1.20')
  model.value = 5
  assert.equal(api.inputValue.value, '5')
  model.value = ''
  api.handleBlur()
  assert.equal(model.value, '')
})
