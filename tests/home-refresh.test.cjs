const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const { ref } = require('vue')

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8')
const plain = (value) => JSON.parse(JSON.stringify(value))

function deferred() {
  let resolve
  let reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

function fixture({ members = async () => [], dishes = async () => ({ list: [] }) } = {}) {
  const calls = { members: [], dishes: [], stop: 0, errors: [] }
  const hooks = {}
  const source = read('src/pages/home/index.vue').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const script = ts.transpileModule(source + '\nexports.state = { familyMemberList, dishList };', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(script, {
    module,
    exports: module.exports,
    ref,
    require(name) {
      if (name === '@dcloudio/uni-app')
        return {
          onLoad: (callback) => {
            hooks.load = callback
          },
          onPullDownRefresh: (callback) => {
            hooks.refresh = callback
          }
        }
      if (name === '@/stores/useUserStore') return { useUserStore: () => ({ familyInfo: { id: 2 } }) }
      if (name === '@/api/modules/family')
        return {
          getFamilyMemberListApi: (id) => {
            calls.members.push(id)
            return members()
          }
        }
      if (name === '@/api/modules/food/dish')
        return {
          getDishListApi: (query) => {
            calls.dishes.push(plain(query))
            return dishes()
          }
        }
      if (name.startsWith('@/utils/')) return {}
      throw new Error('Unexpected import: ' + name)
    },
    uni: {
      stopPullDownRefresh: () => {
        calls.stop++
      }
    },
    console: { error: (...args) => calls.errors.push(args) }
  })
  return { calls, hooks, ...module.exports.state }
}

test('首页已启用下拉刷新', () => {
  const config = ts.parseConfigFileTextToJson('pages.json', read('src/pages.json'))
  assert.equal(config.error, undefined)
  assert.equal(config.config.pages.find((page) => page.path === 'pages/home/index').style.enablePullDownRefresh, true)
})

test('下拉刷新并行重新加载成员和菜品，等待两项完成后停止动画', async () => {
  const members = deferred()
  const dishes = deferred()
  const f = fixture({ members: () => members.promise, dishes: () => dishes.promise })
  const pending = f.hooks.refresh()
  assert.deepEqual(f.calls.members, [2])
  assert.deepEqual(f.calls.dishes, [{ name: '' }])
  assert.equal(f.calls.stop, 0)
  const member = { id: 1, nickname: '新成员', avatarId: 7, avatarUrl: 'new-avatar', urlExpiresAt: 43200000 }
  members.resolve([member])
  await new Promise(setImmediate)
  assert.deepEqual(plain(f.familyMemberList.value), [member])
  assert.equal(f.calls.stop, 0)
  const dish = { id: 3, name: '新菜品', mainImageId: 8, mainImageUrl: 'new-dish' }
  dishes.resolve({ list: [dish] })
  await pending
  assert.deepEqual(plain(f.dishList.value), [dish])
  assert.equal(f.calls.stop, 1)
})

test('任意列表失败仍等待另一项并更新数据，失败列表保留原数据', async () => {
  for (const failed of ['members', 'dishes']) {
    const members = deferred()
    const dishes = deferred()
    const f = fixture({ members: () => members.promise, dishes: () => dishes.promise })
    f.familyMemberList.value = [{ id: 10 }]
    f.dishList.value = [{ id: 20 }]
    const pending = f.hooks.refresh()
    ;({ members, dishes })[failed].reject(new Error('network failed'))
    await new Promise(setImmediate)
    assert.equal(f.calls.stop, 0)
    if (failed === 'members') dishes.resolve({ list: [] })
    else members.resolve([])
    await pending
    assert.equal(f.calls.stop, 1)
    assert.equal(f.calls.errors.length, 1)
    assert.deepEqual(plain(f.familyMemberList.value), failed === 'members' ? [{ id: 10 }] : [])
    assert.deepEqual(plain(f.dishList.value), failed === 'dishes' ? [{ id: 20 }] : [])
  }
})

test('首次加载和每次下拉都重新查询，空响应清空旧列表', async () => {
  const f = fixture()
  await f.hooks.load()
  assert.equal(f.calls.stop, 0)
  f.familyMemberList.value = [{ id: 10 }]
  f.dishList.value = [{ id: 20 }]
  await f.hooks.refresh()
  await f.hooks.refresh()
  assert.equal(f.calls.members.length, 3)
  assert.equal(f.calls.dishes.length, 3)
  assert.equal(f.calls.stop, 2)
  assert.deepEqual(plain(f.familyMemberList.value), [])
  assert.deepEqual(plain(f.dishList.value), [])
})

test('两个列表均失败也会停止刷新动画且不会向外抛出异常', async () => {
  const fail = async () => {
    throw new Error('network failed')
  }
  const f = fixture({ members: fail, dishes: fail })
  await f.hooks.refresh()
  assert.equal(f.calls.stop, 1)
  assert.equal(f.calls.errors.length, 2)
})
