const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const vue = require('vue')

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8')

function fixture({ id = 7, src = 'old-url', expiresTime = 360000, refreshExpiresTime = false, load } = {}) {
  let now = 0
  let nextId = 0
  let unmount
  const timers = new Map()
  const calls = []
  const events = []
  const errors = []
  const appShowListeners = new Set()
  const props = vue.reactive({ id, src, expiresTime, refreshExpiresTime })
  const source = read('src/components/su/SuAvatar/index.vue').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const script = ts.transpileModule(source + '\nexports.localSrc = localSrc;', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText
  const module = { exports: {} }
  const scope = vue.effectScope()
  scope.run(() =>
    vm.runInNewContext(script, {
      module,
      exports: module.exports,
      require(name) {
        if (name === 'vue')
          return {
            ...vue,
            onBeforeUnmount: (callback) => {
              unmount = callback
            }
          }
        if (name === '@/api/common/attachment')
          return {
            async getAttachmentListApi(query) {
              calls.push(JSON.parse(JSON.stringify(query)))
              return load ? load(query) : [{ id: props.id, url: 'new-url', expiresTime: now + 43200000 }]
            }
          }
        throw new Error('Unexpected import: ' + name)
      },
      defineProps: () => props,
      withDefaults: (value) => value,
      defineEmits: () => (event, avatar) => {
        events.push({ event, avatar: JSON.parse(JSON.stringify(avatar)) })
        Object.assign(props, { id: avatar.avatarId, src: avatar.avatarUrl, expiresTime: avatar.expiresTime })
      },
      Date: { now: () => now },
      Number,
      uni: {
        onAppShow: (callback) => appShowListeners.add(callback),
        offAppShow: (callback) => appShowListeners.delete(callback)
      },
      console: { error: (...args) => errors.push(args) },
      setTimeout(callback, delay) {
        const timerId = ++nextId
        timers.set(timerId, { callback, at: now + delay })
        return timerId
      },
      clearTimeout: (timerId) => timers.delete(timerId)
    })
  )
  return {
    props,
    timers,
    calls,
    events,
    errors,
    appShowListeners,
    elapseInBackground(ms) {
      now += ms
    },
    appShow() {
      for (const callback of appShowListeners) callback()
    },
    localSrc: module.exports.localSrc,
    async advance(ms) {
      now += ms
      for (const [timerId, timer] of [...timers]) {
        if (timer.at <= now) {
          timers.delete(timerId)
          timer.callback()
        }
      }
      await Promise.resolve()
      await Promise.resolve()
      await vue.nextTick()
    },
    unmount() {
      unmount()
      scope.stop()
    }
  }
}

test('到期前 5 分钟调用附件接口，映射 expiresTime 并安排下一轮刷新', async () => {
  const f = fixture({ refreshExpiresTime: true })
  await f.advance(59999)
  assert.equal(f.calls.length, 0)
  await f.advance(1)
  assert.deepEqual(f.calls, [{ ids: '7' }])
  assert.equal(f.localSrc.value, 'new-url')
  assert.deepEqual(f.events, [{ event: 'refresh', avatar: { avatarId: 7, avatarUrl: 'new-url', expiresTime: 43260000 } }])
  assert.equal(f.props.expiresTime, 43260000)
  assert.equal(f.timers.size, 1)
  assert.equal([...f.timers.values()][0].at, 42960000)
  await f.advance(42900000)
  assert.equal(f.calls.length, 2)
  f.unmount()
})

test('开启刷新且有效时间临期或已过期时立即刷新', async () => {
  for (const expiresTime of [300000, 100000]) {
    const f = fixture({ expiresTime, refreshExpiresTime: true })
    await f.advance(0)
    assert.equal(f.calls.length, 1)
    f.unmount()
  }
})

test('默认头像不请求；头像属性变化后替换旧定时器', async () => {
  const f = fixture({ id: 0, src: '', expiresTime: null, refreshExpiresTime: true })
  assert.equal(f.timers.size, 0)
  Object.assign(f.props, { id: 8, src: 'avatar-8', expiresTime: 900000 })
  await vue.nextTick()
  assert.equal(f.localSrc.value, 'avatar-8')
  assert.equal(f.timers.size, 1)
  f.props.expiresTime = 1200000
  await vue.nextTick()
  assert.equal(f.timers.size, 1)
  assert.equal([...f.timers.values()][0].at, 900000)
  f.unmount()
})

test('组件卸载时清理刷新定时器', async () => {
  const f = fixture({ refreshExpiresTime: true })
  f.unmount()
  assert.equal(f.timers.size, 0)
  await f.advance(360000)
  assert.equal(f.calls.length, 0)
})

test('无效响应和请求失败不会自动循环请求', async () => {
  for (const load of [
    async () => [],
    async () => [{ id: 7, url: '', expiresTime: 43200000 }],
    async () => [{ id: 7, url: 'url', expiresTime: null }],
    async () => [{ id: 7, url: 'url', expiresTime: 100000 }],
    async () => {
      throw new Error('request failed')
    }
  ]) {
    const f = fixture({ expiresTime: 300000, refreshExpiresTime: true, load })
    await f.advance(0)
    assert.equal(f.calls.length, 1)
    assert.equal(f.events.length, 0)
    assert.equal(f.timers.size, 0)
    f.unmount()
  }
})

test('默认关闭刷新，只更新展示地址，不安排定时器或请求', async () => {
  const f = fixture()
  assert.equal(f.timers.size, 0)
  Object.assign(f.props, { src: 'updated-url', expiresTime: 900000 })
  await vue.nextTick()
  assert.equal(f.localSrc.value, 'updated-url')
  await f.advance(1000000)
  assert.equal(f.calls.length, 0)
  assert.equal(f.events.length, 0)
  assert.equal(f.timers.size, 0)
  f.unmount()
})

test('等待有效过期时间后才开始计时', async () => {
  for (const expiresTime of [null, 0, -1, NaN, Infinity, '360000']) {
    const f = fixture({ expiresTime, refreshExpiresTime: true })
    assert.equal(f.timers.size, 0)
    await f.advance(0)
    assert.equal(f.calls.length, 0)
    f.props.expiresTime = 900000
    await vue.nextTick()
    assert.equal(f.timers.size, 1)
    assert.equal([...f.timers.values()][0].at, 600000)
    f.unmount()
  }
})

test('动态开启时安排计时，关闭时清除计时且不再请求', async () => {
  const f = fixture()
  f.props.refreshExpiresTime = true
  await vue.nextTick()
  assert.equal(f.timers.size, 1)
  f.props.refreshExpiresTime = false
  await vue.nextTick()
  assert.equal(f.timers.size, 0)
  await f.advance(60000)
  assert.equal(f.calls.length, 0)
  f.unmount()
})

test('同一头像多个实例中只有开启的实例请求刷新', async () => {
  const active = fixture({ refreshExpiresTime: true })
  const displayOnly = fixture()
  await Promise.all([active.advance(60000), displayOnly.advance(60000)])
  assert.equal(active.calls.length, 1)
  assert.equal(displayOnly.calls.length, 0)
  assert.equal(displayOnly.timers.size, 0)
  active.unmount()
  displayOnly.unmount()
})

test('回到前台时已过期或临期的头像立即刷新并更新视图', async () => {
  for (const elapsed of [60000, 400000]) {
    const f = fixture({ refreshExpiresTime: true })
    f.elapseInBackground(elapsed)
    assert.equal(f.calls.length, 0)
    f.appShow()
    assert.equal(f.timers.size, 1)
    await f.advance(0)
    assert.equal(f.calls.length, 1)
    assert.equal(f.localSrc.value, 'new-url')
    assert.equal(f.events.length, 1)
    assert.equal(f.timers.size, 1)
    f.unmount()
  }
})

test('回到前台尚未临期时重新计时，不提前请求', async () => {
  const f = fixture({ refreshExpiresTime: true, expiresTime: 900000 })
  f.elapseInBackground(100000)
  f.appShow()
  assert.equal(f.timers.size, 1)
  assert.equal([...f.timers.values()][0].at, 600000)
  await f.advance(499999)
  assert.equal(f.calls.length, 0)
  await f.advance(1)
  assert.equal(f.calls.length, 1)
  f.unmount()
})

test('未开启、默认头像或缺少有效期时前台事件不触发刷新', async () => {
  for (const options of [{}, { refreshExpiresTime: true, id: 0 }, { refreshExpiresTime: true, expiresTime: null }]) {
    const f = fixture(options)
    f.elapseInBackground(1000000)
    f.appShow()
    await f.advance(0)
    assert.equal(f.calls.length, 0)
    assert.equal(f.timers.size, 0)
    f.unmount()
  }
})

test('定时刷新尚未完成时多次回到前台不重复请求', async () => {
  let resolveRequest
  const pending = new Promise((resolve) => { resolveRequest = resolve })
  const f = fixture({ refreshExpiresTime: true, load: () => pending })
  await f.advance(60000)
  assert.equal(f.calls.length, 1)
  for (let i = 0; i < 2; i++) {
    f.appShow()
    await f.advance(0)
  }
  assert.equal(f.calls.length, 1)
  resolveRequest([{ id: 7, url: 'foreground-url', expiresTime: 43260000 }])
  await f.advance(0)
  assert.equal(f.localSrc.value, 'foreground-url')
  assert.equal(f.timers.size, 1)
  f.unmount()
})

test('卸载时移除前台监听，未完成的请求不再回写或重建定时器', async () => {
  let resolveRequest
  const pending = new Promise((resolve) => { resolveRequest = resolve })
  const f = fixture({ refreshExpiresTime: true, load: () => pending })
  await f.advance(60000)
  assert.equal(f.appShowListeners.size, 1)
  f.unmount()
  assert.equal(f.appShowListeners.size, 0)
  resolveRequest([{ id: 7, url: 'late-url', expiresTime: 43260000 }])
  await f.advance(0)
  f.appShow()
  assert.equal(f.events.length, 0)
  assert.equal(f.timers.size, 0)
})

test('仅我的页开启刷新，个人资料使用共享 Store，其他页面仅展示', () => {
  for (const path of ['src/pages/my/index.vue', 'src/views/my/personalProfile/index.vue', 'src/pages/home/index.vue', 'src/views/food/foodOrder/index.vue', 'src/views/food/orderDetail/index.vue']) {
    assert.match(read(path), /:expires-time="[^"]+\.expiresTime"/)
  }
  for (const path of ['src/pages/my/index.vue', 'src/views/my/personalProfile/index.vue']) {
    assert.match(read(path), /@refresh="userStore\.updateUserAvatar"/)
  }
  assert.match(read('src/pages/my/index.vue'), /<SuAvatar[^>]*\srefresh-expires-time(?:\s|\/?>)/)
  for (const path of ['src/views/my/personalProfile/index.vue', 'src/pages/home/index.vue', 'src/views/food/foodOrder/index.vue', 'src/views/food/orderDetail/index.vue']) {
    assert.doesNotMatch(read(path), /<SuAvatar[^>]*\srefresh-expires-time(?:\s|\/?>)/)
  }
  assert.match(read('src/stores/useUserStore.ts'), /expiresTime: data\.expiresTime/)
  assert.match(read('src/stores/useUserStore.ts'), /setUserInfo\(tempUserInfo\)/)
})
