const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const vue = require('vue')

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8')

function fixture({ id = 7, src = 'old-url', expiresAt = 360000, load } = {}) {
  let now = 0
  let nextId = 0
  let unmount
  const timers = new Map()
  const calls = []
  const events = []
  const errors = []
  const props = vue.reactive({ id, src, expiresAt })
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
              return load ? load(query) : [{ id: props.id, url: 'new-url', expiresAt: now + 43200000 }]
            }
          }
        throw new Error('Unexpected import: ' + name)
      },
      defineProps: () => props,
      withDefaults: (value) => value,
      defineEmits: () => (event, avatar) => {
        events.push({ event, avatar: JSON.parse(JSON.stringify(avatar)) })
        Object.assign(props, { id: avatar.avatarId, src: avatar.avatarUrl, expiresAt: avatar.urlExpiresAt })
      },
      Date: { now: () => now },
      Number,
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

test('到期前 5 分钟调用附件接口，映射 expiresAt 并安排下一轮刷新', async () => {
  const f = fixture()
  await f.advance(59999)
  assert.equal(f.calls.length, 0)
  await f.advance(1)
  assert.deepEqual(f.calls, [{ idArr: [7] }])
  assert.equal(f.localSrc.value, 'new-url')
  assert.deepEqual(f.events, [{ event: 'refresh', avatar: { avatarId: 7, avatarUrl: 'new-url', urlExpiresAt: 43260000 } }])
  assert.equal(f.props.expiresAt, 43260000)
  assert.equal(f.timers.size, 1)
  assert.equal([...f.timers.values()][0].at, 42960000)
  await f.advance(42900000)
  assert.equal(f.calls.length, 2)
  f.unmount()
})

test('临期、已过期或缺少有效期时立即刷新', async () => {
  for (const expiresAt of [300000, 100000, -1, null, 0]) {
    const f = fixture({ expiresAt })
    await f.advance(0)
    assert.equal(f.calls.length, 1)
    f.unmount()
  }
})

test('默认头像不请求；头像属性变化后替换旧定时器', async () => {
  const f = fixture({ id: 0, src: '', expiresAt: null })
  assert.equal(f.timers.size, 0)
  Object.assign(f.props, { id: 8, src: 'avatar-8', expiresAt: 900000 })
  await vue.nextTick()
  assert.equal(f.localSrc.value, 'avatar-8')
  assert.equal(f.timers.size, 1)
  f.props.expiresAt = 1200000
  await vue.nextTick()
  assert.equal(f.timers.size, 1)
  assert.equal([...f.timers.values()][0].at, 900000)
  f.unmount()
})

test('组件卸载时清理刷新定时器', async () => {
  const f = fixture()
  f.unmount()
  assert.equal(f.timers.size, 0)
  await f.advance(360000)
  assert.equal(f.calls.length, 0)
})

test('无效响应和请求失败不会自动循环请求', async () => {
  for (const load of [
    async () => [],
    async () => [{ id: 7, url: '', expiresAt: 43200000 }],
    async () => [{ id: 7, url: 'url', expiresAt: null }],
    async () => [{ id: 7, url: 'url', expiresAt: 100000 }],
    async () => {
      throw new Error('request failed')
    }
  ]) {
    const f = fixture({ expiresAt: null, load })
    await f.advance(0)
    assert.equal(f.calls.length, 1)
    assert.equal(f.events.length, 0)
    assert.equal(f.timers.size, 0)
    f.unmount()
  }
})

test('五处用户头像均接入数据回写，当前用户仍由 Store 保存缓存', () => {
  for (const path of ['src/pages/my/index.vue', 'src/views/my/personalProfile/index.vue']) {
    assert.match(read(path), /@refresh="userStore\.updateUserAvatar"/)
  }
  for (const [path, target] of [
    ['src/pages/home/index.vue', 'item'],
    ['src/views/food/foodOrder/index.vue', 'item.createUser'],
    ['src/views/food/orderDetail/index.vue', 'formData.createUser']
  ]) {
    assert.ok(read(path).includes('@refresh="Object.assign(' + target + ', $event)"'))
  }
  assert.match(read('src/stores/useUserStore.ts'), /urlExpiresAt: data\.urlExpiresAt/)
  assert.match(read('src/stores/useUserStore.ts'), /setUserInfo\(tempUserInfo\)/)
})
