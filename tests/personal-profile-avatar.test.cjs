const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const { ref } = require('vue')

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8')
function load(source, globals) {
  const module = { exports: {} }
  const script = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText
  vm.runInNewContext(script, { module, exports: module.exports, ref, ...globals })
  return module.exports
}

function fixture({ size = 100, fileError, uploadError, bindError, bind, upload } = {}) {
  const calls = { files: [], uploads: [], bindings: [], caches: [], toasts: [], loading: [] }
  const store = load(read('src/stores/useUserStore.ts'), {
    require(name) {
      if (name === 'pinia') return { defineStore: (_id, setup) => setup }
      if (name === '@/api/modules/user' || name === '@/api/modules/family') return {}
      if (name === '@/utils/user') return { setUserInfo: (value) => calls.caches.push({ ...value }) }
      throw new Error(`Unexpected import: ${name}`)
    }
  }).useUserStore()
  store.token.value = 'token'
  store.userInfo.value = { id: 1, familyId: 2, nickname: '用户', avatarId: 7, avatarUrl: 'old.jpg' }
  const pageStore = {
    get token() { return store.token.value },
    get userInfo() { return store.userInfo.value },
    updateUserAvatar: store.updateUserAvatar
  }
  const script = read('src/views/my/personalProfile/index.vue').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const api = load(script + '\nexports.api = { handleChooseAvatar, avatarBusy };', {
    require(name) {
      if (name === '@wot-ui/ui') return { useDialog: () => ({}) }
      if (name === '@/stores/useUserStore') return { useUserStore: () => pageStore }
      if (name === '@/api/modules/user') return {
        async updateUserAvatarApi(params) {
          calls.bindings.push(params)
          if (bindError) throw bindError
          return bind ? bind() : { avatarId: 42, avatarUrl: 'new.jpg' }
        }
      }
      if (name === '@/utils/upload') return {
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
      async getFileInfo(params) {
        calls.files.push(params.filePath)
        if (fileError) throw fileError
        return { size }
      },
      showLoading: ({ title }) => calls.loading.push(title),
      hideLoading: () => calls.loading.push('hide'),
      showToast: ({ title }) => calls.toasts.push(title)
    }
  }).api
  return { api, store, calls }
}

test('头像整行直接使用原生 chooseAvatar，移除自定义面板及独立选图交互', () => {
  const page = read('src/views/my/personalProfile/index.vue')
  assert.match(page, /<button class="row-item avatar-row"[^>]*:disabled="avatarBusy"[^>]*open-type="chooseAvatar"[^>]*@chooseavatar="handleChooseAvatar">\s*<view class="item-left">头像<\/view>/)
  assert.doesNotMatch(page, /wd-action-sheet|showAvatarSheet|avatar-actions|avatar-action|chooseAvatarImage|chooseMedia|AvatarMediaResult|@click="updateAvatar"/)
})

test('原生面板返回的图片统一读取大小、上传、绑定并同步 Store 和缓存', async () => {
  const { api, store, calls } = fixture()
  for (const filePath of ['wxfile://wechat', 'wxfile://album', 'wxfile://camera']) {
    await api.handleChooseAvatar({ detail: { avatarUrl: filePath } })
    assert.equal(calls.files.at(-1), filePath)
    assert.equal(calls.uploads.at(-1).filePath, filePath)
    assert.equal(calls.uploads.at(-1).module, 'user')
    assert.equal(calls.uploads.at(-1).moduleType, 'avatar')
    assert.equal(calls.bindings.at(-1).avatarId, 42)
    assert.equal(api.avatarBusy.value, false)
  }
  assert.deepEqual(calls.caches.at(-1), { id: 1, familyId: 2, nickname: '用户', avatarId: 42, avatarUrl: 'new.jpg' })
  assert.equal(store.userInfo.value.avatarUrl, 'new.jpg')
  assert.equal(calls.toasts.length, 3)
  assert.equal(calls.loading.at(-1), 'hide')
})

test('没有选中图片时不上传、不修改头像、不提示错误', async () => {
  const { api, calls } = fixture()
  for (const event of [undefined, {}, { detail: {} }, { detail: { avatarUrl: '' } }]) await api.handleChooseAvatar(event)
  assert.equal(calls.files.length, 0)
  assert.equal(calls.uploads.length, 0)
  assert.equal(calls.caches.length, 0)
  assert.equal(calls.toasts.length, 0)
  assert.equal(api.avatarBusy.value, false)
})

test('超过 5 MB 或读取、上传、绑定失败时保留旧头像并恢复忙碌状态', async () => {
  for (const config of [
    { size: 5 * 1024 * 1024 + 1 },
    { fileError: new Error('读取失败') },
    { uploadError: new Error('上传失败') },
    { bindError: new Error('保存失败') },
    { bind: () => ({ avatarId: 0, avatarUrl: '' }) }
  ]) {
    const { api, store, calls } = fixture(config)
    await api.handleChooseAvatar({ detail: { avatarUrl: 'wxfile://avatar' } })
    assert.equal(store.userInfo.value.avatarUrl, 'old.jpg')
    assert.equal(calls.caches.length, 0)
    assert.equal(api.avatarBusy.value, false)
    assert.equal(calls.toasts.length, 1)
    assert.notEqual(calls.toasts[0], '头像已更新')
    if (config.size) assert.equal(calls.uploads.length, 0)
    if (config.uploadError || config.bindError || config.bind) assert.equal(calls.loading.at(-1), 'hide')
  }
})

test('上传时防止重复更新，会话切换后不再绑定和覆盖头像', async () => {
  let finish
  const { api, store, calls } = fixture({ upload: () => new Promise((resolve) => { finish = resolve }) })
  const event = { detail: { avatarUrl: 'wxfile://avatar' } }
  const pending = api.handleChooseAvatar(event)
  for (let index = 0; index < 5; index++) await Promise.resolve()
  assert.equal(api.avatarBusy.value, true)
  await api.handleChooseAvatar(event)
  assert.equal(calls.uploads.length, 1)
  store.token.value = 'new-token'
  finish({ id: 42 })
  await pending
  assert.equal(calls.bindings.length, 0)
  assert.equal(calls.caches.length, 0)
  assert.equal(calls.toasts.length, 0)
  assert.equal(api.avatarBusy.value, false)
  assert.equal(calls.loading.at(-1), 'hide')
})
