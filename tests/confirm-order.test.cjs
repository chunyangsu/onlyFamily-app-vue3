const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const { ref, computed } = require('vue')

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true
    }
  }).outputText
}

// 加载真实高精度工具和页面脚本，使用 Vue 响应式验证合计。
const decimalModule = { exports: {} }
vm.runInNewContext(compile(readFileSync(resolve(__dirname, '../src/utils/decimal.ts'), 'utf8')), {
  module: decimalModule,
  exports: decimalModule.exports,
  require
})
const source = readFileSync(resolve(__dirname, '../src/views/food/confirmOrder/index.vue'), 'utf8')
  .match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
const script = compile(source + '\nexports.api = { orderList, totalPrice };')

function createPage(items = []) {
  const module = { exports: {} }
  vm.runInNewContext(script, {
    module,
    exports: module.exports,
    require(name) {
      if (name === '@/utils/decimal') return decimalModule.exports
      if (name === '@/api/modules/food/foodOrder') return {}
      throw new Error(`Unexpected import: ${name}`)
    },
    ref,
    computed,
    onLoad() {}
  })
  module.exports.api.orderList.value = items
  return module.exports.api
}

test('空订单显示 0.00', () => {
  assert.equal(createPage().totalPrice.value, '0.00')
})

test('字符串单价精确相乘并累加，合计四舍五入到两位小数', () => {
  assert.equal(createPage([{ price: '0.1', num: 3 }, { price: '0.2', num: 1 }]).totalPrice.value, '0.50')
  assert.equal(createPage([{ price: '1.005', num: 1 }]).totalPrice.value, '1.01')
  assert.equal(createPage([{ price: '2.55', num: 1 }]).totalPrice.value, '2.55')
})

test('仅在最终合计时舍入，不逐项舍入', () => {
  assert.equal(createPage([{ price: '0.004', num: 1 }, { price: '0.004', num: 1 }]).totalPrice.value, '0.01')
})

test('大金额不丢失精度', () => {
  assert.equal(createPage([{ price: '9007199254740993.01', num: 3 }]).totalPrice.value, '27021597764222979.03')
})

test('数量、单价和订单列表变化时重新计算', () => {
  const page = createPage([{ price: '0.1', num: 1 }])
  assert.equal(page.totalPrice.value, '0.10')
  page.orderList.value[0].num = 3
  assert.equal(page.totalPrice.value, '0.30')
  page.orderList.value[0].price = '0.2'
  assert.equal(page.totalPrice.value, '0.60')
  page.orderList.value.push({ price: '1.005', num: 2 })
  assert.equal(page.totalPrice.value, '2.61')
  page.orderList.value = []
  assert.equal(page.totalPrice.value, '0.00')
})
