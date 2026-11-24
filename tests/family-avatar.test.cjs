const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8')
function load(source, globals) {
  const module = { exports: {} }
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } })
  vm.runInNewContext(compiled.outputText, { module, exports: module.exports, ref: (value) => ({ value }), ...globals })
  return module.exports
}

function fixture({ cancel, size = 100, upload, bind, uploadError, bindError } = {}) {
  const calls = { uploads: [], bindings: [], caches: [], sources: [], toasts: [], loading: [] }
  const store = load(read('src/stores/useUserStore.ts'), {
    require(name) {
      if (name === 'pinia') return { defineStore: (_id, setup) => setup }
      if (name === '@/api/modules/user' || name === '@/api/modules/family') return {}
      if (name === '@/utils/user') return { setFamilyInfo: (value) => calls.caches.push({ ...value }) }
      throw new Error(`Unexpected import: ${name}`)
    }
  }).useUserStore()
  store.token.value = 'token'
  store.userInfo.value = { id: 1, familyId: 2, nickname: '用户', avatarId: 9, avatarUrl: 'user.jpg' }
  store.familyInfo.value = { id: 2, name: '家庭', avatarId: 7, avatarUrl: 'old.jpg' }
  const pageStore = {
    get token() {
      return store.token.value
    },
    get userInfo() {
      return store.userInfo.value
    },
    updateFamilyAvatar: store.updateFamilyAvatar
  }
  const script = read('src/views/my/familyManage/index.vue').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const api = load(script + '\nexports.api = { updateAvatar, chooseAvatarImage, avatarBusy, showAvatarSheet };', {
    require(name) {
      if (name === '@/stores/useUserStore') return { useUserStore: () => pageStore }
      if (name === '@/api/modules/family')
        return {
          async updateFamilyAvatarApi(params) {
            calls.bindings.push(params)
            if (bindError) throw bindError
            return bind ? bind() : { avatarId: 42, avatarUrl: 'new.jpg' }
          }
        }
      if (name === '@/utils/upload')
        return {
          getUploadErrorMessage: (error) => error.message || error.errMsg,
          async uploadAttachment(params) {
            calls.uploads.push(params)
            if (uploadError) throw uploadError
            return upload ? upload() : { id: 42 }
          }
        }
      throw new Error(`Unexpected import: ${name}`)
    },
    uni: {
      chooseMedia(options) {
        calls.sources.push(options.sourceType[0])
        if (cancel) options.fail({ errMsg: 'chooseMedia:fail cancel' })
        else options.success({ tempFiles: [{ tempFilePath: 'wxfile://image', size }] })
      },
      showLoading: (value) => calls.loading.push(value.title),
      hideLoading: () => calls.loading.push('hide'),
      showToast: (value) => calls.toasts.push(value.title)
    }
  }).api
  return { api, store, calls }
}

test('点击头像打开操作层，相册和拍照均通过 family/avatar 上传绑定，成功同步家庭缓存', async () => {
  const { api, store, calls } = fixture()
  api.updateAvatar()
  assert.equal(api.showAvatarSheet.value, true)
  await api.chooseAvatarImage('album')
  await api.chooseAvatarImage('camera')
  assert.deepEqual(calls.sources, ['album', 'camera'])
  assert.ok(calls.uploads.every((item) => item.module === 'family' && item.moduleType === 'avatar'))
  assert.equal(calls.bindings.length, 2)
  assert.ok(calls.bindings.every((item) => item.avatarId === 42))
  assert.equal(store.familyInfo.value.avatarUrl, 'new.jpg')
  assert.deepEqual(calls.caches[1], { id: 2, name: '家庭', avatarId: 42, avatarUrl: 'new.jpg' })
  assert.equal(store.userInfo.value.avatarId, 9)
  assert.equal(api.avatarBusy.value, false)
  assert.deepEqual(calls.toasts, ['家庭头像已更新', '家庭头像已更新'])
})

test('取消选择不上传、不报错，超过 5 MB 不上传', async () => {
  const cancelled = fixture({ cancel: true })
  await cancelled.api.chooseAvatarImage('album')
  assert.equal(cancelled.calls.uploads.length, 0)
  assert.equal(cancelled.calls.toasts.length, 0)
  assert.equal(cancelled.api.avatarBusy.value, false)
  const large = fixture({ size: 5 * 1024 * 1024 + 1 })
  await large.api.chooseAvatarImage('camera')
  assert.equal(large.calls.uploads.length, 0)
  assert.equal(large.api.avatarBusy.value, false)
  assert.match(large.calls.toasts[0], /5 MB/)
})

test('上传、绑定失败或响应异常时保留旧家庭头像，恢复忙碌状态和 loading', async () => {
  for (const config of [{ uploadError: new Error('upload failed') }, { bindError: new Error('bind failed') }, { bind: async () => ({ avatarId: 0, avatarUrl: '' }) }]) {
    const { api, store, calls } = fixture(config)
    await api.chooseAvatarImage('album')
    assert.equal(store.familyInfo.value.avatarId, 7)
    assert.equal(calls.caches.length, 0)
    assert.equal(calls.loading.at(-1), 'hide')
    assert.equal(api.avatarBusy.value, false)
    assert.ok(!calls.toasts.includes('家庭头像已更新'))
  }
})

test('绑定成功前不更新 Store 或缓存，且阻止重复选择', async () => {
  let complete
  const { api, store, calls } = fixture({
    bind: () =>
      new Promise((resolve) => {
        complete = resolve
      })
  })
  const pending = api.chooseAvatarImage('album')
  await new Promise(setImmediate)
  await api.chooseAvatarImage('camera')
  api.updateAvatar()
  assert.equal(calls.sources.length, 1)
  assert.equal(api.showAvatarSheet.value, false)
  assert.equal(store.familyInfo.value.avatarId, 7)
  assert.equal(calls.caches.length, 0)
  complete({ avatarId: 42, avatarUrl: 'new.jpg' })
  await pending
  assert.equal(store.familyInfo.value.avatarId, 42)
  assert.equal(api.avatarBusy.value, false)
})

test('上传后或绑定后切换用户、家庭或凭证，不把旧响应写入新会话', async () => {
  for (const stage of ['upload', 'bind']) {
    for (const field of ['user', 'family', 'token']) {
      let complete
      const { api, store, calls } = fixture({
        [stage]: () =>
          new Promise((resolve) => {
            complete = resolve
          })
      })
      const pending = api.chooseAvatarImage('album')
      await new Promise(setImmediate)
      if (field === 'user') store.userInfo.value.id = 8
      if (field === 'family') store.userInfo.value.familyId = 8
      if (field === 'token') store.token.value = 'new-token'
      complete(stage === 'upload' ? { id: 42 } : { avatarId: 42, avatarUrl: 'new.jpg' })
      await pending
      assert.equal(calls.caches.length, 0)
      assert.equal(calls.toasts.length, 0)
      assert.equal(store.familyInfo.value.avatarId, 7)
      assert.equal(calls.loading.at(-1), 'hide')
      if (stage === 'upload') assert.equal(calls.bindings.length, 0)
    }
  }
})
