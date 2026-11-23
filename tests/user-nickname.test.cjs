const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8')
function load(source, require) {
  const module = { exports: {} }
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
  vm.runInNewContext(compiled.outputText, { module, exports: module.exports, require, ref: (value) => ({ value }), uni: { showToast: (value) => toasts.push(value.title) } })
  return module.exports
}
let toasts

function createNickname({ nickname = '原昵称', submit } = {}) {
  toasts = []
  const calls = { requests: [], caches: [], dialogs: [] }
  const store = load(read('src/stores/useUserStore.ts'), (name) => {
    if (name === 'pinia') return { defineStore: (_id, setup) => setup }
    if (name === '@/api/modules/user') return {}
    return { setUserInfo: (value) => calls.caches.push({ ...value }) }
  }).useUserStore()
  store.token.value = 'token'
  store.userInfo.value = { id: 1, familyId: 2, nickname, avatarId: 3, avatarUrl: 'avatar.jpg' }
  const pageStore = {
    get userInfo() {
      return store.userInfo.value
    },
    get token() {
      return store.token.value
    },
    updateUserNickname: store.updateUserNickname
  }
  const script = read('src/views/my/personalProfile/index.vue').match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const api = load(script + '\nexports.api = { updateNickname, saveNickname, nicknameDraft, nicknameBusy };', (name) => {
    if (name === '@wot-ui/ui')
      return {
        useDialog: () => ({
          confirm(options) {
            calls.dialogs.push(options)
            return Promise.reject({ action: 'cancel' })
          }
        })
      }
    if (name === '@/stores/useUserStore') return { useUserStore: () => pageStore }
    if (name === '@/api/modules/user')
      return {
        async updateUserNicknameApi(params) {
          calls.requests.push(params)
          return submit ? submit(params) : { nickname: params.nickname }
        }
      }
    if (name === '@/utils/upload') return { getUploadErrorMessage: (error) => error.message }
    throw new Error(`Unexpected import: ${name}`)
  }).api
  return { api, store, calls }
}

test('昵称弹窗每次打开代入当前昵称；无昵称为空；取消不提交、不修改 Store', async () => {
  const { api, store, calls } = createNickname()
  api.updateNickname()
  assert.equal(api.nicknameDraft.value, '原昵称')
  assert.equal(calls.dialogs[0].title, '修改昵称')
  assert.equal(calls.dialogs[0].beforeConfirm, api.saveNickname)
  api.nicknameDraft.value = '未保存'
  api.updateNickname()
  assert.equal(api.nicknameDraft.value, '原昵称')
  store.userInfo.value.nickname = undefined
  api.updateNickname()
  assert.equal(api.nicknameDraft.value, '')
  await Promise.resolve()
  assert.equal(calls.requests.length, 0)
  assert.equal(calls.caches.length, 0)
})

test('手动或微信选择的昵称统一提交，使用响应昵称同步 Store 和缓存，保留其他字段', async () => {
  const { api, store, calls } = createNickname({ submit: async () => ({ nickname: '服务端昵称' }) })
  api.nicknameDraft.value = '  新昵称  '
  assert.equal(await api.saveNickname(), true)
  assert.equal(calls.requests[0].nickname, '新昵称')
  assert.equal(store.userInfo.value.nickname, '服务端昵称')
  assert.deepEqual(calls.caches[0], { id: 1, familyId: 2, nickname: '服务端昵称', avatarId: 3, avatarUrl: 'avatar.jpg' })
  assert.equal(api.nicknameBusy.value, false)
  assert.deepEqual(toasts, ['昵称已更新'])
})

test('空昵称不请求；接口失败或响应异常时不关闭弹窗、不修改昵称，支持重试', async () => {
  for (const submit of [
    async () => {
      throw new Error('保存失败')
    },
    async () => ({ nickname: '' })
  ]) {
    const { api, store, calls } = createNickname({ submit })
    api.nicknameDraft.value = '  '
    assert.equal(await api.saveNickname(), false)
    assert.equal(calls.requests.length, 0)
    api.nicknameDraft.value = '新昵称'
    assert.equal(await api.saveNickname(), false)
    assert.equal(api.nicknameDraft.value, '新昵称')
    assert.equal(api.nicknameBusy.value, false)
    assert.equal(store.userInfo.value.nickname, '原昵称')
    assert.equal(calls.caches.length, 0)
  }
})

test('保存期间阻止重复提交；会话切换后不回写旧请求结果', async () => {
  let resolveRequest
  const { api, store, calls } = createNickname({
    submit: () =>
      new Promise((resolve) => {
        resolveRequest = resolve
      })
  })
  api.nicknameDraft.value = '新昵称'
  const pending = api.saveNickname()
  assert.equal(api.nicknameBusy.value, true)
  assert.equal(await api.saveNickname(), false)
  api.updateNickname()
  assert.equal(calls.dialogs.length, 0)
  assert.equal(calls.requests.length, 1)
  store.token.value = 'new-token'
  resolveRequest({ nickname: '新昵称' })
  assert.equal(await pending, true)
  assert.equal(store.userInfo.value.nickname, '原昵称')
  assert.equal(calls.caches.length, 0)
  assert.equal(api.nicknameBusy.value, false)
  assert.equal(toasts.length, 0)
})

test('弹窗使用 SuInput 和原生 nickname 类型；输入、清空通过 model 更新，不修改 props', () => {
  const page = read('src/views/my/personalProfile/index.vue')
  const input = read('src/components/su/SuInput/index.vue')
  assert.match(page, /<wd-dialog selector="nickname">/)
  assert.match(page, /<SuInput v-model="nicknameDraft" type="nickname"/)
  assert.match(page, /:disabled="nicknameBusy" @click="cancel"/)
  assert.match(page, /:loading="nicknameBusy" :disabled="nicknameBusy" @click="confirm"/)
  assert.match(input, /props.type === 'nickname' \? 'nickname' : 'text'/)
  assert.match(input, /@update:model-value="handleInput"/)
  assert.doesNotMatch(input, /v-model="props.modelValue"/)
})
