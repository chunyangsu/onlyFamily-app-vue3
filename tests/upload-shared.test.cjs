const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

function load(source, globals = {}) {
  const module = { exports: {} }
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  })
  vm.runInNewContext(compiled.outputText, { module, exports: module.exports, Error, ...globals })
  return module.exports
}

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8')
const setup = (path) => read(path).match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
const tick = () => new Promise(setImmediate)

function createUpload({ status = 200, policyError, uploadError, registrationError, invalidId = false } = {}) {
  const calls = { policies: [], uploads: [], registrations: [] }
  let nextId = 100
  const uni = {
    base64ToArrayBuffer(value) {
      const bytes = Buffer.from(value, 'base64')
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    },
    uploadFile(options) {
      calls.uploads.push(options)
      queueMicrotask(() => {
        if (uploadError) options.fail(uploadError)
        else options.success({ statusCode: status, data: status >= 400 ? '<Code>AccessDenied</Code><RequestId>req-123</RequestId>' : '' })
      })
      return {
        onProgressUpdate(callback) {
          callback({ progress: 50 })
        },
        abort() {}
      }
    }
  }
  const helpers = load(read('src/components/su/SuUpload/util.ts'), { uni })
  const api = load(read('src/utils/upload.ts'), {
    uni,
    require(name) {
      if (name === '@/components/su/SuUpload/util') return helpers
      if (name === '@/api/common/oss')
        return {
          async getUploadPolicyApi(params) {
            calls.policies.push(params)
            if (policyError) throw policyError
            return {
              host: 'https://example.oss-cn-shanghai.aliyuncs.com',
              objectKey: `${params.module}/image-${calls.policies.length}.jpg`,
              policy: Buffer.from(JSON.stringify({ expiration: new Date(Date.now() + 600000).toISOString(), conditions: [] })).toString('base64'),
              signatureVersion: 'OSS4-HMAC-SHA256',
              credential: 'test-ak/20261122/cn-shanghai/oss/aliyun_v4_request',
              date: '20261122T010203Z',
              signature: 'a'.repeat(64),
              successActionStatus: status < 400 ? status : 200
            }
          }
        }
      if (name === '@/api/common/attachment')
        return {
          async addAttachmentApi(items) {
            calls.registrations.push(items)
            if (registrationError) throw registrationError
            return [{ id: invalidId ? 0 : ++nextId, objectKey: items[0].objectKey }]
          }
        }
      throw new Error(`Unexpected import: ${name}`)
    }
  })
  return { api, calls }
}

for (const status of [200, 201, 204]) {
  test(`公共上传支持 HTTP ${status}，保留表单、进度并登记附件`, async () => {
    const { api, calls } = createUpload({ status })
    const progress = []
    let task
    const result = await api.uploadAttachment({
      filePath: 'wxfile://image.png',
      module: 'food',
      moduleType: 'dish',
      onProgress: (event) => progress.push(event.progress),
      onTask: (value) => {
        task = value
      }
    })
    assert.equal(calls.policies[0].module, 'food')
    assert.equal(calls.registrations[0][0].moduleType, 'dish')
    assert.equal(calls.uploads[0].name, 'file')
    assert.equal(calls.uploads[0].header, undefined)
    assert.equal(calls.uploads[0].formData.success_action_status, String(status))
    assert.equal(calls.registrations[0][0].mimeType, 'image/png')
    assert.equal(calls.registrations[0][0].name, '')
    assert.equal(result.id, 101)
    assert.equal(result.response.statusCode, status)
    assert.equal(typeof task.abort, 'function')
    assert.deepEqual(progress, [50])
  })
}

test('凭证、OSS、网络、登记失败均拒绝 Promise，不误报成功', async () => {
  for (const config of [
    { policyError: new Error('policy failed') },
    { status: 403 },
    { uploadError: { errMsg: 'network failed' } },
    { registrationError: new Error('register failed') },
    { invalidId: true }
  ]) {
    const { api, calls } = createUpload(config)
    await assert.rejects(api.uploadAttachment({ filePath: 'wxfile://tmp', module: 'avatar' }))
    if (config.policyError) assert.equal(calls.uploads.length, 0)
    if (config.status || config.uploadError) assert.equal(calls.registrations.length, 0)
  }
})

test('保留 OSS 错误诊断；无路径、非图片在请求前失败；MIME 兼容无扩展名临时路径', async () => {
  const { api, calls } = createUpload({ status: 403 })
  await assert.rejects(api.uploadAttachment({ filePath: '', module: 'avatar' }), /路径/)
  await assert.rejects(api.uploadAttachment({ filePath: 'a.txt', fileType: 'file', module: 'dish' }), /JPG/)
  assert.equal(calls.policies.length, 0)
  assert.equal(api.getFileMimeType('wxfile://tmp', 'image'), 'image/jpeg')
  assert.equal(api.getFileMimeType('image.WEBP?x=1', 'image'), 'image/webp')
  await assert.rejects(api.uploadAttachment({ filePath: 'wxfile://tmp', module: 'avatar' }), (error) => {
    assert.equal(error.code, 'AccessDenied')
    assert.equal(error.requestId, 'req-123')
    return true
  })
})

test('附件登记完成前不会返回成功结果', async () => {
  let registerDone
  let settled = false
  const api = load(read('src/utils/upload.ts'), {
    require(name) {
      if (name === '@/api/common/oss') return { getUploadPolicyApi: async () => ({ objectKey: 'avatar/a.jpg' }) }
      if (name === '@/api/common/attachment')
        return {
          addAttachmentApi: () =>
            new Promise((resolve) => {
              registerDone = resolve
            })
        }
      return { buildOssRequest: () => ({ url: 'https://oss.example', formData: {} }) }
    },
    uni: {
      uploadFile(options) {
        queueMicrotask(() => options.success({ statusCode: 200, data: '' }))
        return {}
      }
    }
  })
  const result = api.uploadAttachment({ filePath: 'a.jpg', module: 'avatar' }).then((value) => {
    settled = true
    return value
  })
  await tick()
  assert.equal(settled, false)
  registerDone([{ id: 1, objectKey: 'avatar/a.jpg' }])
  assert.equal((await result).id, 1)
})

function createComponent(config) {
  const { api: upload, calls } = createUpload(config)
  const events = []
  const component = load(setup('src/components/su/SuUpload/index.vue') + '\nexports.api = { customUpload, handleSuccess, handleRemove, attachmentList, beforeUpload };', {
    require: () => upload,
    defineProps: () => ({ module: 'dish' }),
    withDefaults: (props, defaults) => ({ ...defaults, ...props }),
    defineEmits: () => (name, value) => events.push([name, Array.from(value)]),
    ref: (value) => ({ value }),
    uni: { showToast() {} }
  }).api
  return { component, calls, events }
}

test('SuUpload 并发完成后仍按文件顺序回传 ID，不回传失败/上传中的空 ID', async () => {
  const { component, calls, events } = createComponent()
  const files = [
    { uid: 1, url: 'a.jpg' },
    { uid: 2, url: 'b.jpg' },
    { uid: 3, url: 'c.jpg' }
  ]
  component.attachmentList.value = files
  const progress = []
  const options = {
    onProgress: (event, file) => progress.push([file.uid, event.progress]),
    onError: assert.fail,
    onSuccess: (res, file, formData) => component.handleSuccess({ file, fileList: files, formData })
  }
  await Promise.all(files.slice(0, 2).map((file) => component.customUpload(file, {}, options)))
  assert.equal(calls.registrations.length, 2)
  assert.deepEqual(progress, [
    [1, 50],
    [2, 50]
  ])
  assert.deepEqual(events.at(-2), ['update:modelValue', [101, 102]])
  assert.deepEqual(events.at(-1), ['upload-success', [101, 102]])
  component.handleRemove({ file: files[0] })
  assert.deepEqual(events.at(-1), ['update:modelValue', [102]])
})

test('SuUpload 登记失败进入 onError，保留 message，不触发成功事件', async () => {
  for (const config of [{ registrationError: new Error('register failed') }, { status: 403 }]) {
    const { component, events } = createComponent(config)
    let failure
    await component.customUpload(
      { uid: 1, url: 'a.jpg' },
      {},
      {
        onProgress() {},
        onSuccess: assert.fail,
        onError: (error) => {
          failure = error
        }
      }
    )
    assert.equal(failure.message, failure.errMsg)
    if (config.status) assert.equal(failure.requestId, 'req-123')
    assert.equal(events.length, 0)
  }
})

function createAvatar({ cancel = false, fail = false, bindError, bind, size = 100 } = {}) {
  const calls = { uploads: [], bindings: [], caches: [], sources: [], toasts: [], loading: [] }
  const store = load(read('src/stores/useUserStore.ts'), {
    ref: (value) => ({ value }),
    require(name) {
      if (name === 'pinia') return { defineStore: (_id, setupStore) => setupStore }
      if (name === '@/api/modules/user') return {}
      return { setUserInfo: (value) => calls.caches.push(JSON.parse(JSON.stringify(value))) }
    }
  }).useUserStore()
  store.token.value = 'token-1'
  store.userInfo.value = { id: 1, familyId: 2, nickname: '用户', avatarId: 7, avatarUrl: 'https://example.com/old.jpg' }
  const pageStore = {
    get token() {
      return store.token.value
    },
    get userInfo() {
      return store.userInfo.value
    },
    updateUserAvatar: store.updateUserAvatar
  }
  const api = load(setup('src/views/my/personalProfile/index.vue') + '\nexports.api = { chooseAvatarImage, handleChooseAvatar, avatarBusy };', {
    require(name) {
      if (name === '@wot-ui/ui') return { useDialog: () => ({}) }
      if (name === '@/stores/useUserStore') return { useUserStore: () => pageStore }
      if (name === '@/api/modules/user')
        return {
          async updateUserAvatarApi(params) {
            calls.bindings.push(params)
            if (bindError) throw bindError
            if (bind) return bind()
            return { avatarId: 42, avatarUrl: 'https://example.com/new.jpg' }
          }
        }
      return {
        getUploadErrorMessage: (error) => error.message || error.errMsg,
        async uploadAttachment(options) {
          calls.uploads.push(options)
          if (fail) throw new Error('upload failed')
          return { id: 42, objectKey: 'avatar/new.jpg' }
        }
      }
    },
    ref: (value) => ({ value }),
    shallowRef: (value) => ({ value }),
    uni: {
      chooseMedia(options) {
        calls.sources.push(options.sourceType[0])
        if (cancel) options.fail({ errMsg: 'chooseMedia:fail cancel' })
        else options.success({ tempFiles: [{ tempFilePath: 'wxfile://selected.jpg', size }] })
      },
      getFileInfo: async () => ({ size }),
      showLoading: () => calls.loading.push(true),
      hideLoading: () => calls.loading.push(false),
      showToast: (options) => calls.toasts.push(options.title)
    }
  }).api
  return { api, calls, store }
}

test('头像三种来源共用 user/avatar 上传，绑定成功后同步 Store 和缓存', async () => {
  const { api, calls, store } = createAvatar()
  await api.chooseAvatarImage('album')
  await api.chooseAvatarImage('camera')
  await api.handleChooseAvatar({ detail: { avatarUrl: 'wxfile://wechat.jpg' } })
  assert.deepEqual(calls.sources, ['album', 'camera'])
  assert.equal(calls.uploads.length, 3)
  assert.ok(calls.uploads.every((item) => item.module === 'user' && item.moduleType === 'avatar'))
  assert.deepEqual(
    calls.bindings.map((item) => item.avatarId),
    [42, 42, 42]
  )
  assert.equal(store.userInfo.value.avatarId, 42)
  assert.equal(store.userInfo.value.avatarUrl, 'https://example.com/new.jpg')
  assert.equal(store.userInfo.value.nickname, '用户')
  assert.equal(store.userInfo.value.familyId, 2)
  assert.equal(calls.caches.length, 3)
  assert.deepEqual(calls.caches.at(-1), JSON.parse(JSON.stringify(store.userInfo.value)))
  assert.equal(api.avatarBusy.value, false)
  assert.deepEqual(calls.toasts, ['头像已更新', '头像已更新', '头像已更新'])
})

test('头像主动取消不上传不报错；上传失败恢复忙碌状态和 loading', async () => {
  const cancelled = createAvatar({ cancel: true })
  await cancelled.api.chooseAvatarImage('album')
  assert.equal(cancelled.calls.uploads.length, 0)
  assert.equal(cancelled.calls.toasts.length, 0)
  assert.equal(cancelled.api.avatarBusy.value, false)
  const failed = createAvatar({ fail: true })
  await failed.api.chooseAvatarImage('camera')
  assert.deepEqual(failed.calls.loading, [true, false])
  assert.equal(failed.api.avatarBusy.value, false)
  assert.equal(failed.calls.bindings.length, 0)
  assert.equal(failed.calls.caches.length, 0)
  assert.equal(failed.store.userInfo.value.avatarId, 7)
})

test('绑定失败或响应不完整时保留旧头像和缓存，恢复 loading/忙碌状态', async () => {
  for (const config of [{ bindError: new Error('bind failed') }, { bind: () => ({ avatarId: 0, avatarUrl: '' }) }, { bind: () => ({ avatarId: 42, avatarUrl: '' }) }]) {
    const { api, calls, store } = createAvatar(config)
    await api.chooseAvatarImage('album')
    assert.equal(calls.bindings.length, 1)
    assert.equal(calls.caches.length, 0)
    assert.equal(store.userInfo.value.avatarId, 7)
    assert.equal(store.userInfo.value.avatarUrl, 'https://example.com/old.jpg')
    assert.equal(calls.toasts.length, 1)
    assert.ok(!calls.toasts.includes('头像已更新'))
    assert.equal(calls.loading.at(-1), false)
    assert.equal(api.avatarBusy.value, false)
  }
})

test('绑定完成前不更新 Store/缓存、不提示成功且阻止重复提交', async () => {
  let finish
  const { api, calls, store } = createAvatar({
    bind: () =>
      new Promise((resolve) => {
        finish = resolve
      })
  })
  const pending = api.chooseAvatarImage('camera')
  await tick()
  assert.equal(api.avatarBusy.value, true)
  assert.equal(store.userInfo.value.avatarId, 7)
  assert.equal(calls.caches.length, 0)
  assert.equal(calls.toasts.length, 0)
  await api.chooseAvatarImage('album')
  assert.equal(calls.uploads.length, 1)
  finish({ avatarId: 42, avatarUrl: 'https://example.com/new.jpg' })
  await pending
  assert.equal(store.userInfo.value.avatarId, 42)
  assert.equal(api.avatarBusy.value, false)
})

test('绑定期间切换账号、家庭或凭证，不把旧响应写入当前会话', async () => {
  for (const change of [
    (store) => {
      store.userInfo.value.id = 2
    },
    (store) => {
      store.userInfo.value.familyId = 3
    },
    (store) => {
      store.token.value = 'token-2'
    }
  ]) {
    let finish
    const { api, calls, store } = createAvatar({
      bind: () =>
        new Promise((resolve) => {
          finish = resolve
        })
    })
    const pending = api.chooseAvatarImage('album')
    await tick()
    change(store)
    finish({ avatarId: 42, avatarUrl: 'https://example.com/new.jpg' })
    await pending
    assert.equal(store.userInfo.value.avatarId, 7)
    assert.equal(calls.caches.length, 0)
    assert.equal(calls.toasts.length, 0)
    assert.equal(api.avatarBusy.value, false)
  }
})

test('三种来源均拒绝超过 5 MB 的图片，不上传不绑定', async () => {
  const { api, calls } = createAvatar({ size: 5 * 1024 * 1024 + 1 })
  await api.chooseAvatarImage('album')
  await api.chooseAvatarImage('camera')
  await api.handleChooseAvatar({ detail: { avatarUrl: 'wxfile://wechat.jpg' } })
  assert.equal(calls.uploads.length, 0)
  assert.equal(calls.bindings.length, 0)
  assert.equal(api.avatarBusy.value, false)
  assert.equal(calls.toasts.length, 3)
})

test('HTTP 非 200 响应均拒绝 Promise，保留后端错误信息，401 仍执行退出处理', async () => {
  for (const statusCode of [400, 403, 500, 401]) {
    const calls = { removed: 0, redirects: 0 }
    const request = load(read('src/api/service.ts').replace('import.meta.env.VITE_APP_BASE_API', "'https://api.example'"), {
      require: () => ({ removeToken: () => calls.removed++, removeUserInfo: () => calls.removed++ }),
      uni: {
        getStorageSync: () => '',
        request: (options) => options.success({ statusCode, data: { code: 10001, msg: '后端错误' } }),
        reLaunch: () => calls.redirects++,
        showToast() {}
      }
    }).default
    await assert.rejects(request({ url: '/api/user/updateAvatar' }), (error) => error.statusCode === statusCode && error.msg === '后端错误')
    assert.equal(calls.removed, statusCode === 401 ? 2 : 0)
    assert.equal(calls.redirects, statusCode === 401 ? 1 : 0)
  }
})

test('头像忙碌时不重复选择或上传', async () => {
  const { api, calls } = createAvatar()
  api.avatarBusy.value = true
  await api.chooseAvatarImage('album')
  await api.handleChooseAvatar({ detail: { avatarUrl: 'wxfile://wechat.jpg' } })
  assert.equal(calls.uploads.length, 0)
  assert.equal(calls.sources.length, 0)
})
