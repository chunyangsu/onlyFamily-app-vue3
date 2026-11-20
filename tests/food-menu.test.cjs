const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const sass = require('sass')

// 加载真实的高精度工具，确保购物车测试不会用浮点数实现替代它。
const decimalModule = { exports: {} }
vm.runInNewContext(ts.transpileModule(
  readFileSync(resolve(__dirname, '../src/utils/decimal.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }
).outputText, { module: decimalModule, exports: decimalModule.exports, require })

// 直接测试页面脚本，不向业务组件暴露测试接口
const filename = resolve(__dirname, '../src/pages/foodMenu/index.vue')
const source = readFileSync(filename, 'utf8').match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]

test('小程序禁止整页滚动，固定页面并为购物车保留底部空间', () => {
  const page = readFileSync(filename, 'utf8')
  const style = page.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1]
  const variables = readFileSync(resolve(__dirname, '../src/styles/variables.scss'), 'utf8')
  const css = sass.compileString(variables + '\n' + style).css
  const root = css.match(/\.food-menu\s*\{([^}]+)\}/)[1]
  const pagesSource = readFileSync(resolve(__dirname, '../src/pages.json'), 'utf8')
  const pages = ts.parseConfigFileTextToJson('pages.json', pagesSource).config.pages
  assert.equal(pages.find(item => item.path === 'pages/foodMenu/index').style.disableScroll, true)
  assert.match(root, /position: fixed/)
  assert.match(root, /top: 0/)
  assert.match(root, /bottom: 0/)
  assert.match(root, /overflow: hidden/)
  assert.doesNotMatch(page, /pageHeight/)
  assert.match(css, /\.footer\s*\{[^}]*flex-shrink: 0/)
  assert.match(css, /\.dish-scroll\s*\{[^}]*overflow: hidden/)
  assert.match(page, /@touchmove\.stop\.prevent/)
  assert.match(page, /refresher-enabled\s+:refresher-triggered="refreshing"/)
  assert.match(page, /@refresherrefresh="onMenuRefresh"/)
  assert.doesNotMatch(page, /H5|@wheel|--window-|uni-scroll-view|overscroll-behavior/)
})
const compiled = ts.transpileModule(
  source +
    `
exports.api = {
  loadMenu, selectCategory, onDishScroll, onCategoryScroll, interruptScroll, refreshLayout,
  measureLayout, retryLoadMenu, goToConfirmOrder, onMenuRefresh, goToAddDish,
  get state() {
    return {
      active: activedCategory.value, categories: categoryList.value, groups: dishGroupList.value,
      total: dishTotal.value, tail: tailHeight.value, top: dishScrollTop.value,
      leftTop: categoryScrollTop.value, target: scrollTarget, loading: loading.value,
      error: loadError.value, positions: groupPositions, refreshing: refreshing.value,
      cartPriceTotal: cartPriceTotal.value
    }
  }
}`,
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }
).outputText

// 分类顺序故意与接口分组顺序不同，覆盖无菜品分类
function defaultData() {
  return {
    categories: [
      { id: 8, name: '荤菜' },
      { id: 25, name: '素菜' },
      { id: 90, name: '汤品' }
    ],
    response: {
      total: 2,
      list: [
        {
          categoryId: 90,
          categoryName: '汤品',
          dishList: [{ id: 2, name: '汤', mainImageId: 12, mainImageUrl: 'soup.jpg', price: 5 }]
        },
        {
          categoryId: 8,
          categoryName: '荤菜',
          dishList: [{ id: 1, name: '肉', mainImageId: 11, mainImageUrl: 'meat.jpg', price: 10 }]
        }
      ]
    }
  }
}

// 模拟小程序节点测量和可控时钟，逐帧检查动画及取消行为
function createPage(data = defaultData()) {
  const hooks = {}
  const timers = new Map()
  const calls = { categories: 0, dishes: [], navigation: [], events: [], pageEvents: {} }
  let clock = 0
  let timerId = 0
  let viewportHeight = 400
  let heights = [500, 120, 100]
  let contentShift = 0
  const module = { exports: {} }
  let api
  const globals = {
    module,
    exports: module.exports,
    require(name) {
      if (name === '@/utils/decimal') return decimalModule.exports
      if (name === '@/api/modules/food/category')
        return {
          async getDishCategoryListApi() {
            calls.categories++
            if (data.waitCategories) await data.waitCategories
            if (data.fail) throw new Error('offline')
            return data.categories
          }
        }
      if (name === '@/api/modules/food/dish')
        return {
          async getDishListApi(query) {
            calls.dishes.push(query)
            return data.response
          }
        }
      throw new Error(`Unexpected import: ${name}`)
    },
    ref: (value) => ({ value }),
    computed: (get) => ({
      get value() {
        return get()
      }
    }),
    getCurrentInstance: () => ({ proxy: {} }),
    nextTick: async () => {},
    Date: { now: () => clock },
    setTimeout(callback, delay) {
      const id = ++timerId
      timers.set(id, { at: clock + delay, callback })
      return id
    },
    clearTimeout(id) {
      timers.delete(id)
    },
    console: { warn() {} },
    uni: {
      navigateTo(options) {
        calls.navigation.push(options.url)
        calls.pageEvents = options.events ?? {}
        options.success?.({
          eventChannel: {
            emit(name, data) {
              calls.events.push({ name, data })
            }
          }
        })
      },
      onWindowResize: (callback) => {
        hooks.resize = callback
      },
      offWindowResize: (callback) => {
        if (hooks.resize === callback) delete hooks.resize
      },
      createSelectorQuery() {
        const query = {
          in() {
            return query
          },
          select() {
            return query
          },
          selectAll() {
            return query
          },
          boundingClientRect() {
            return query
          },
          exec(callback) {
            let top = 200 - contentShift
            const groups = api.state.groups.map((_, index) => {
              const rect = { top, height: heights[index] }
              top += heights[index]
              return rect
            })
            callback([
              { top: 200, height: viewportHeight },
              { top: 200 - contentShift, height: top },
              groups,
              { top: 160, height: 160 },
              { top: 160, height: 300 },
              api.state.categories.map((_, index) => ({ top: 160 + index * 100, height: 100 }))
            ])
          }
        }
        return query
      }
    }
  }
  for (const name of ['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload']) {
    globals[name] = (callback) => {
      hooks[name] = callback
    }
  }
  vm.runInNewContext(compiled, globals)
  api = module.exports.api
  return {
    api,
    hooks,
    calls,
    data,
    async flush() {
      for (let index = 0; index < 20; index++) await Promise.resolve()
    },
    async enter() {
      hooks.onLoad()
      hooks.onShow()
      hooks.onReady()
      await this.flush()
    },
    scroll(top) {
      api.onDishScroll({ detail: { scrollTop: top } })
    },
    async tick(milliseconds, feedback = true) {
      const end = clock + milliseconds
      while (true) {
        const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0]
        if (!next || next[1].at > end) break
        timers.delete(next[0])
        clock = next[1].at
        next[1].callback()
        await this.flush()
        if (feedback) this.scroll(api.state.top)
      }
      clock = end
      await this.flush()
    },
    setLayout(options) {
      viewportHeight = options.viewportHeight ?? viewportHeight
      heights = options.heights ?? heights
      contentShift = options.contentShift ?? contentShift
    }
  }
}

test('首次仅加载一次，按分类排序并保留空分类，直接使用列表主图', async () => {
  const page = createPage()
  await page.enter()
  const state = page.api.state
  assert.equal(page.calls.categories, 1)
  assert.equal(page.calls.dishes.length, 1)
  assert.equal(page.calls.dishes[0].categoryIds, '8,25,90')
  assert.equal(state.groups.map((group) => group.categoryId).join(), '8,25,90')
  assert.equal(state.groups[1].dishList.length, 0)
  assert.equal(state.groups[0].dishList[0].mainImageUrl, 'meat.jpg')
  assert.equal(state.groups[2].dishList[0].mainImageUrl, 'soup.jpg')
  assert.equal(state.active, 8)
  assert.equal(state.total, 2)
  assert.equal(state.tail, 300)
})

test('购物车总价使用高精度运算，支持空购物车、数量变化和大金额', async () => {
  const page = createPage()
  await page.enter()
  assert.equal(page.api.state.cartPriceTotal, '0.00')
  const first = page.api.state.groups[0].dishList[0]
  const second = page.api.state.groups[2].dishList[0]
  first.price = '0.10'
  first.cartNum = 3
  second.price = '0.20'
  second.cartNum = 1
  assert.equal(page.api.state.cartPriceTotal, '0.50')

  first.price = '9007199254740993.01'
  first.cartNum = 1
  assert.equal(page.api.state.cartPriceTotal, '9007199254740993.21')

  // 先汇总再四舍五入，不能逐项舍入。
  first.price = '0.005'
  second.price = '0.005'
  assert.equal(page.api.state.cartPriceTotal, '0.01')
  second.cartNum = 0
  assert.equal(page.api.state.cartPriceTotal, '0.01')
  first.cartNum = 0
  assert.equal(page.api.state.cartPriceTotal, '0.00')
})

test('返回页面只恢复布局，不重复请求，保留选购数量和滚动位置', async () => {
  const page = createPage()
  await page.enter()
  page.api.state.groups[0].dishList[0].cartNum = 3
  page.scroll(530)
  for (let index = 0; index < 2; index++) {
    page.hooks.onHide()
    page.hooks.onShow()
    await page.flush()
  }
  assert.equal(page.calls.categories, 1)
  assert.equal(page.calls.dishes.length, 1)
  assert.equal(page.api.state.groups[0].dishList[0].cartNum, 3)
  assert.equal(page.api.state.active, 25)
  assert.equal(page.api.state.top, 530)
})

// 运行真实添加页保存脚本，模拟页面事件通道和返回时序
function createAddDishPage(menu, { fail = false } = {}) {
  const addSource = readFileSync(resolve(__dirname, '../src/views/food/addDish/index.vue'), 'utf8')
    .match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  const script = ts.transpileModule(addSource + '\nexports.api = { saveData };', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText
  const calls = { saves: 0, back: 0, notifications: 0 }
  const module = { exports: {} }
  vm.runInNewContext(script, {
    module,
    exports: module.exports,
    require(name) {
      if (name === '@/api/modules/food/category') return {}
      if (name === '@/api/modules/food/dish') return {
        async createDishApi() {
          calls.saves++
          if (fail) throw new Error('save failed')
        }
      }
      throw new Error(`Unexpected import: ${name}`)
    },
    ref: value => ({ value }),
    computed: get => ({ get value() { return get() } }),
    getCurrentInstance: () => ({ proxy: {
      getOpenerEventChannel: () => ({ emit(name) {
        calls.notifications++
        menu.calls.pageEvents[name]?.()
        // 通知发出时菜单仍隐藏，不应提前发请求
        assert.equal(menu.calls.categories, 1)
      } })
    } }),
    onLoad() {},
    console: { error() {} },
    uni: { navigateBack(options) {
      assert.equal(options.delta, 1)
      calls.back++
      menu.hooks.onShow()
    } }
  })
  return { calls, api: module.exports.api }
}

test('添加成功后返回并自动刷新一次，普通返回和保存失败不刷新', async () => {
  const page = createPage()
  await page.enter()
  page.api.goToAddDish()
  assert.equal(page.calls.navigation[0], '/views/food/addDish/index')
  page.hooks.onHide()
  const failed = createAddDishPage(page, { fail: true })
  await failed.api.saveData()
  assert.equal(failed.calls.notifications, 0)
  assert.equal(failed.calls.back, 0)
  page.hooks.onShow()
  await page.flush()
  assert.equal(page.calls.categories, 1)

  page.api.state.groups[0].dishList[0].cartNum = 3
  page.api.goToAddDish()
  page.hooks.onHide()
  page.data.response.list[1].dishList.push({ id: 3, name: '新菜', mainImageUrl: 'new.jpg', price: 12 })
  page.data.response.total = 3
  const success = createAddDishPage(page)
  await success.api.saveData()
  await page.flush()
  assert.equal(success.calls.notifications, 1)
  assert.equal(success.calls.back, 1)
  assert.equal(page.calls.categories, 2)
  assert.equal(page.calls.dishes.length, 2)
  assert.equal(page.api.state.groups[0].dishList.length, 2)
  assert.equal(page.api.state.groups[0].dishList[0].cartNum, 3)
  page.hooks.onHide()
  page.hooks.onShow()
  await page.flush()
  assert.equal(page.calls.categories, 2)
})

test('添加成功返回遇到旧请求时，旧请求结束后补一次刷新', async () => {
  const page = createPage()
  await page.enter()
  let release
  page.data.waitCategories = new Promise(resolve => { release = resolve })
  const pending = page.api.loadMenu()
  page.api.goToAddDish()
  page.hooks.onHide()
  page.calls.pageEvents.dishCreated()
  page.hooks.onShow()
  assert.equal(page.calls.categories, 2)
  release()
  await pending
  await page.flush()
  assert.equal(page.calls.categories, 3)
  assert.equal(page.calls.dishes.length, 3)
  assert.equal(page.api.state.loading, false)
})

test('下拉刷新重新请求分类及菜品，保留数量和定位，重复触发不重复请求', async () => {
  const page = createPage()
  await page.enter()
  assert.equal(page.api.state.refreshing, false)
  page.api.state.groups[0].dishList[0].cartNum = 3
  page.scroll(530)
  page.data.response.list[1].dishList[0].mainImageUrl = 'new-meat.jpg'
  const pending = page.api.onMenuRefresh()
  assert.equal(page.api.state.refreshing, true)
  await page.api.onMenuRefresh()
  await pending
  assert.equal(page.calls.categories, 2)
  assert.equal(page.calls.dishes.length, 2)
  assert.equal(page.api.state.groups[0].dishList[0].mainImageUrl, 'new-meat.jpg')
  assert.equal(page.api.state.groups[0].dishList[0].cartNum, 3)
  assert.equal(page.api.state.active, 25)
  assert.equal(page.api.state.top, 530)
  assert.equal(page.api.state.refreshing, false)
})

test('刷新失败保留旧列表并结束动画，再次下拉可恢复', async () => {
  const page = createPage()
  await page.enter()
  page.data.fail = true
  await page.api.onMenuRefresh()
  assert.equal(page.api.state.error, true)
  assert.equal(page.api.state.refreshing, false)
  assert.equal(page.api.state.groups.length, 3)
  page.data.fail = false
  await page.api.onMenuRefresh()
  assert.equal(page.api.state.error, false)
  assert.equal(page.api.state.refreshing, false)
  assert.equal(page.calls.categories, 3)
  assert.equal(page.calls.dishes.length, 2)
})

test('首次请求未完成时下拉不叠加请求，刷新动画正确结束', async () => {
  let release
  const waitCategories = new Promise(resolve => { release = resolve })
  const page = createPage({ ...defaultData(), waitCategories })
  await page.enter()
  assert.equal(page.api.state.loading, true)
  assert.equal(page.api.state.refreshing, false)
  await page.api.onMenuRefresh()
  assert.equal(page.api.state.refreshing, false)
  assert.equal(page.calls.categories, 1)
  release()
  await page.flush()
  assert.equal(page.calls.dishes.length, 1)
  assert.equal(page.api.state.loading, false)
})

test('空分类及首次失败返回时不自动重试，但可手动下拉加载', async () => {
  for (const data of [
    { categories: [], response: { list: [], total: 0 } },
    { ...defaultData(), fail: true }
  ]) {
    const page = createPage(data)
    await page.enter()
    page.hooks.onHide()
    page.hooks.onShow()
    await page.flush()
    assert.equal(page.calls.categories, 1)
    Object.assign(page.data, defaultData(), { fail: false })
    await page.api.onMenuRefresh()
    assert.equal(page.calls.categories, 2)
    assert.equal(page.calls.dishes.length, 1)
    assert.equal(page.api.state.groups.length, 3)
    assert.equal(page.api.state.error, false)
    assert.equal(page.api.state.refreshing, false)
  }
})

test('刷新采用最新主图地址，不被同主图ID的旧缓存覆盖，同时保留选购数量', async () => {
  const page = createPage()
  await page.enter()
  page.api.state.groups[0].dishList[0].cartNum = 3
  const dish = page.data.response.list[1].dishList[0]
  dish.mainImageUrl = 'meat.jpg?signature=new'
  await page.api.loadMenu()
  assert.equal(page.api.state.groups[0].dishList[0].mainImageUrl, dish.mainImageUrl)
  assert.equal(page.api.state.groups[0].dishList[0].cartNum, 3)
  dish.mainImageUrl = ''
  await page.api.loadMenu()
  assert.equal(page.api.state.groups[0].dishList[0].mainImageUrl, '')
  assert.equal(page.api.state.error, false)
})

test('下单携带列表主图，确认订单页使用相同字段展示', async () => {
  const page = createPage()
  await page.enter()
  page.api.state.groups[0].dishList[0].cartNum = 2
  page.api.goToConfirmOrder()
  assert.equal(page.calls.navigation[0], '/views/food/confirmOrder/index')
  assert.equal(page.calls.events[0].name, 'cartData')
  assert.equal(page.calls.events[0].data.length, 1)
  const dish = page.calls.events[0].data[0]
  assert.equal(dish.mainImageUrl, 'meat.jpg')
  assert.equal(dish.num, 2)
  const confirmation = readFileSync(resolve(__dirname, '../src/views/food/confirmOrder/index.vue'), 'utf8')
  assert.match(confirmation, /:src="item\.mainImageUrl"/)
  assert.doesNotMatch(confirmation, /attachmentUrl/)
})

test('上下滚动联动高亮，支持顶部回弹和像素容差', async () => {
  const page = createPage()
  await page.enter()
  page.scroll(499)
  assert.equal(page.api.state.active, 25)
  page.scroll(620)
  assert.equal(page.api.state.active, 90)
  page.scroll(510)
  assert.equal(page.api.state.active, 25)
  page.scroll(-10)
  assert.equal(page.api.state.active, 8)
})

test('点击末分类缓出置顶，动画期间不高亮途经分类', async () => {
  const page = createPage()
  await page.enter()
  await page.api.selectCategory(90)
  assert.equal(page.api.state.active, 90)
  await page.tick(120)
  const halfway = page.api.state.top
  assert.ok(halfway > 0 && halfway < 620)
  assert.equal(page.api.state.active, 90)
  await page.tick(500)
  assert.equal(page.api.state.top, 620)
  assert.equal(page.api.state.target, null)
  assert.equal(page.api.state.leftTop, 140)
  assert.equal(page.calls.dishes.length, 1)
})

test('快速连续点击以最后一次为准，同分类手动滑走后可再次置顶', async () => {
  const page = createPage()
  await page.enter()
  const first = page.api.selectCategory(90)
  const last = page.api.selectCategory(25)
  await Promise.all([first, last])
  await page.tick(1000)
  assert.equal(page.api.state.top, 500)
  assert.equal(page.api.state.active, 25)
  page.api.interruptScroll()
  page.scroll(550)
  await page.api.selectCategory(25)
  await page.tick(1000)
  assert.equal(page.api.state.top, 500)
})

test('手势打断后旧动画不再移动列表', async () => {
  const page = createPage()
  await page.enter()
  await page.api.selectCategory(90)
  await page.tick(80)
  page.api.interruptScroll()
  page.scroll(40)
  const stoppedTop = page.api.state.top
  await page.tick(1600, false)
  assert.equal(page.api.state.top, stoppedTop)
  assert.equal(page.api.state.target, null)
  assert.equal(page.api.state.active, 8)
})

test('没有最终滚动事件时也能解除定位锁定', async () => {
  const page = createPage()
  await page.enter()
  await page.api.selectCategory(90)
  await page.tick(1600, false)
  assert.equal(page.api.state.target, null)
  page.scroll(500)
  assert.equal(page.api.state.active, 25)
})

test('列表已滚动时测量仍以内容为起点，窗口变化重算末尾留白', async () => {
  const page = createPage()
  await page.enter()
  page.scroll(530)
  page.setLayout({ viewportHeight: 600, contentShift: 530 })
  page.hooks.resize()
  await page.tick(150, false)
  assert.equal(page.api.state.positions[1].top, 500)
  assert.equal(page.api.state.top, 530)
  assert.equal(page.api.state.tail, 500)
})

test('刷新保留数量和组内位置，分类移除后回到首分类', async () => {
  const page = createPage()
  await page.enter()
  page.api.state.groups[0].dishList[0].cartNum = 3
  page.scroll(530)
  await page.api.loadMenu()
  assert.equal(page.api.state.groups[0].dishList[0].cartNum, 3)
  assert.equal(page.api.state.active, 25)
  assert.equal(page.api.state.top, 530)
  page.data.categories = [page.data.categories[0]]
  await page.api.loadMenu()
  assert.equal(page.api.state.active, 8)
  assert.equal(page.api.state.top, 0)
})

test('末分类超过一屏时不加留白，恢复位置不超过可滚动边界', async () => {
  const page = createPage()
  page.setLayout({ heights: [500, 120, 700] })
  await page.enter()
  assert.equal(page.api.state.tail, 0)
  await page.api.selectCategory(90)
  await page.tick(1000)
  assert.equal(page.api.state.top, 620)
  page.scroll(900)
  page.setLayout({ viewportHeight: 650 })
  await page.api.refreshLayout()
  assert.equal(page.api.state.top, 670)
  assert.equal(page.api.state.active, 90)
})

test('测量期间点击或手势操作，不被过期恢复任务覆盖', async () => {
  const page = createPage()
  await page.enter()
  const refresh = page.api.refreshLayout()
  const click = page.api.selectCategory(90)
  await Promise.all([refresh, click])
  await page.tick(1000)
  assert.equal(page.api.state.top, 620)
  assert.equal(page.api.state.active, 90)
  const pending = page.api.selectCategory(25)
  page.api.interruptScroll()
  await pending
  const top = page.api.state.top
  await page.tick(1000, false)
  assert.equal(page.api.state.top, top)
})

test('零分类不请求菜品，加载失败可重试', async () => {
  const empty = createPage({ categories: [], response: { list: [], total: 0 } })
  await empty.enter()
  assert.equal(empty.calls.dishes.length, 0)
  assert.equal(empty.api.state.active, null)
  assert.equal(empty.api.state.tail, 0)
  const failed = createPage({ ...defaultData(), fail: true })
  await failed.enter()
  assert.equal(failed.api.state.error, true)
  failed.data.fail = false
  failed.api.retryLoadMenu()
  await failed.flush()
  assert.equal(failed.api.state.error, false)
  assert.equal(failed.api.state.groups.length, 3)
})

test('单个短分类和全空分类也可置顶', async () => {
  const page = createPage({
    categories: [{ id: 7, name: '空分类' }],
    response: { list: [], total: 0 }
  })
  page.setLayout({ heights: [120] })
  await page.enter()
  assert.equal(page.api.state.tail, 280)
  await page.api.selectCategory(7)
  assert.equal(page.api.state.top, 0)
  assert.equal(page.api.state.active, 7)
})

test('页面隐藏或卸载时清理动画和监听', async () => {
  const page = createPage()
  await page.enter()
  await page.api.selectCategory(90)
  await page.tick(60)
  page.hooks.onHide()
  const stoppedTop = page.api.state.top
  await page.tick(1200, false)
  assert.equal(page.api.state.top, stoppedTop)
  page.hooks.onUnload()
  assert.equal(page.hooks.resize, undefined)
})

for (const pageFile of ['src/pages/foodMenu/index.vue', 'src/views/food/addDish/index.vue']) {
test(`${pageFile} 脚本通过 TypeScript 语义检查`, () => {
  const virtualFile = resolve(__dirname, '..', pageFile.replace('index.vue', '__page_check__.ts'))
  const pageSource = readFileSync(resolve(__dirname, '..', pageFile), 'utf8').match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  const config = ts.getParsedCommandLineOfConfigFile(
    resolve(__dirname, '../tsconfig.json'),
    {
      noEmit: true
    },
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic() {} }
  )
  const host = ts.createCompilerHost(config.options)
  const readFile = host.readFile.bind(host)
  const fileExists = host.fileExists.bind(host)
  host.readFile = (file) => (resolve(file) === virtualFile ? pageSource : readFile(file))
  host.fileExists = (file) => resolve(file) === virtualFile || fileExists(file)
  const program = ts.createProgram(
    [...config.fileNames.filter((file) => !file.endsWith('.vue')), virtualFile],
    config.options,
    host
  )
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter((item) => item.file && resolve(item.file.fileName) === virtualFile)
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getCanonicalFileName: (file) => file,
      getNewLine: () => '\n'
    })
  )
})
}
