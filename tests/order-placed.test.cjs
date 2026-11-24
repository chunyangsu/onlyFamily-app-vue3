const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const { ref, computed } = require('vue')

const decimalModule = { exports: {} }
vm.runInNewContext(ts.transpileModule(readFileSync(resolve(__dirname, '../src/utils/decimal.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
}).outputText, { module: decimalModule, exports: decimalModule.exports, require })

function createFlow() {
  const listeners = new Map()
  const navigation = []
  const uni = {
    $on(name, callback) {
      listeners.set(name, callback)
    },
    $off(name, callback) {
      if (listeners.get(name) === callback) listeners.delete(name)
    },
    $emit(name) {
      listeners.get(name)?.()
    },
    switchTab(options) {
      navigation.push(options.url)
    },
    onWindowResize() {},
    offWindowResize() {}
  }

  function loadPage(path, exposed) {
    const hooks = {}
    const module = { exports: {} }
    const source = readFileSync(resolve(__dirname, '../src', path), 'utf8').match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
    const script = ts.transpileModule(source + `\nexports.api = { ${exposed} }`, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
    }).outputText
    const context = {
      module,
      exports: module.exports,
      require(name) {
        if (name === '@/api/modules/food/category') return { getDishCategoryListApi: async () => [] }
        if (name === '@/api/modules/food/dish') return {}
        if (name === '@/utils/decimal') return decimalModule.exports
        throw new Error(`Unexpected import: ${name}`)
      },
      uni,
      ref,
      computed,
      getCurrentInstance: () => null,
      nextTick: async () => {},
      clearTimeout,
      console
    }
    for (const name of ['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload', 'onShareAppMessage']) {
      context[name] = (callback) => {
        hooks[name] = callback
      }
    }
    vm.runInNewContext(script, context)
    return { api: module.exports.api, hooks }
  }

  const menu = loadPage('pages/foodMenu/index.vue', 'dishGroupList, cartData, selectedDishTotal, cartPriceTotal')
  const placed = loadPage('views/food/orderPlaced/index.vue', 'goBack')
  return { menu, placed, listeners, navigation }
}

async function enterMenu(menu) {
  menu.hooks.onLoad()
  for (let index = 0; index < 10; index++) await Promise.resolve()
  menu.api.dishGroupList.value = [
    { categoryId: 1, dishList: [{ id: 1, cartNum: 2, price: '10.00' }] },
    { categoryId: 2, dishList: [] },
    { categoryId: 3, dishList: [{ id: 2, cartNum: 3, price: '5.00' }, { id: 3, cartNum: 0, price: '1.00' }] }
  ]
}

test('成功页返回厨房 tab，同时清空所有分类的选购数量和购物车', async () => {
  const { menu, placed, navigation } = createFlow()
  await enterMenu(menu)
  assert.equal(menu.api.cartData.value.length, 2)
  assert.equal(menu.api.selectedDishTotal.value, 5)
  assert.equal(menu.api.cartPriceTotal.value, '35.00')
  placed.api.goBack()
  assert.deepEqual(navigation, ['/pages/foodMenu/index'])
  assert.equal(menu.api.cartData.value.length, 0)
  assert.equal(menu.api.selectedDishTotal.value, 0)
  assert.equal(menu.api.cartPriceTotal.value, '0.00')
  assert.ok(menu.api.dishGroupList.value.flatMap((group) => group.dishList).every((dish) => dish.cartNum === 0))
  assert.equal(menu.api.dishGroupList.value.length, 3)
})

test('普通显示菜单不清空，卸载时移除本页监听', async () => {
  const { menu, listeners } = createFlow()
  await enterMenu(menu)
  menu.hooks.onShow()
  assert.equal(menu.api.selectedDishTotal.value, 5)
  assert.equal(listeners.size, 1)
  menu.hooks.onUnload()
  assert.equal(listeners.size, 0)
})

test('菜单尚未加载时也可以从成功页返回厨房', () => {
  const { placed, navigation } = createFlow()
  placed.api.goBack()
  assert.deepEqual(navigation, ['/pages/foodMenu/index'])
})
