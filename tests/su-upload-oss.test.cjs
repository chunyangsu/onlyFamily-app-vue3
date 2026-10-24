const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')

function loadTs(source, globals = {}) {
  const module = { exports: {} }
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  })
  vm.runInNewContext(compiled.outputText, { module, exports: module.exports, Error, ...globals })
  return module.exports
}

const uniBase64 = {
  base64ToArrayBuffer(value) {
    const bytes = Buffer.from(value, 'base64')
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  }
}
const helpers = loadTs(readFileSync(resolve(__dirname, '../src/components/su/SuUpload/ossUpload.ts'), 'utf8'), { uni: uniBase64 })

function makePolicy(conditions = [], overrides = {}) {
  const expiration = new Date(Date.now() + 600000).toISOString()
  return {
    host: 'https://example.oss-cn-hangzhou.aliyuncs.com',
    bucket: 'example', region: 'cn-hangzhou', objectKey: 'food/test.jpg',
    policy: Buffer.from(JSON.stringify({ expiration, conditions })).toString('base64'),
    signatureVersion: 'OSS4-HMAC-SHA256',
    credential: 'test-ak/20261023/cn-hangzhou/oss/aliyun_v4_request',
    date: '20261023T010203Z', signature: 'a'.repeat(64),
    contentType: 'image/jpeg', maxFileSize: 10485760, expiration,
    ...overrides
  }
}

test('builds V4 multipart fields without rewriting signed values', () => {
  const policy = makePolicy([], { securityToken: 'test-token' })
  const request = helpers.buildOssPostRequest(policy)
  assert.equal(request.url, policy.host)
  assert.equal(request.formData.policy, policy.policy)
  assert.equal(request.formData['Content-Type'], 'image/jpeg')
  assert.equal(request.formData['x-oss-signature'], policy.signature)
  assert.equal(request.formData['x-oss-security-token'], 'test-token')
  assert.equal(request.formData.success_action_status, '200')
  assert.ok(!('file' in request.formData))
})

test('uses 201/204 from signed policy instead of hardcoded 200', () => {
  assert.equal(helpers.buildOssPostRequest(makePolicy([['eq', '$success_action_status', '201']])).formData.success_action_status, '201')
  assert.equal(helpers.buildOssPostRequest(makePolicy([{ success_action_status: '204' }])).formData.success_action_status, '204')
})

test('omits missing STS token and rejects a token required by signed policy', () => {
  assert.ok(!('x-oss-security-token' in helpers.buildOssPostRequest(makePolicy()).formData))
  assert.throws(() => helpers.buildOssPostRequest(makePolicy([{ 'x-oss-security-token': 'required' }])), /x-oss-security-token/)
})

test('rejects missing fields, invalid V4 values and non-root endpoints', () => {
  for (const field of ['host', 'objectKey', 'policy', 'signatureVersion', 'credential', 'date', 'signature', 'contentType']) {
    assert.throws(() => helpers.buildOssPostRequest(makePolicy([], { [field]: undefined })), new RegExp(field))
  }
  assert.throws(() => helpers.buildOssPostRequest(makePolicy([], { signatureVersion: 'v4' })), /OSS4-HMAC-SHA256/)
  assert.throws(() => helpers.buildOssPostRequest(makePolicy([], { signature: 'base64-signature' })), /64/)
  assert.throws(() => helpers.buildOssPostRequest(makePolicy([], { host: 'https://example.com/file.jpg' })), /host/)
  assert.throws(() => helpers.buildOssPostRequest(makePolicy([], { credential: 'ak/20261022/cn-hangzhou/oss/aliyun_v4_request' })), /credential/)
})

test('rejects malformed/expired policies and exact field mismatches', () => {
  assert.throws(() => helpers.buildOssPostRequest(makePolicy([], { policy: 'invalid' })), /Base64 JSON/)
  const expired = Buffer.from(JSON.stringify({ expiration: '2000-01-01T00:00:00Z', conditions: [] })).toString('base64')
  assert.throws(() => helpers.buildOssPostRequest(makePolicy([], { policy: expired })), /过期/)
  assert.throws(() => helpers.buildOssPostRequest(makePolicy([['eq', '$Content-Type', 'image/png']])), /Content-Type/)
  assert.throws(() => helpers.buildOssPostRequest(makePolicy([{ key: 'different.jpg' }])), /key/)
})

test('reads OSS XML diagnostics (including entities and CDATA)', () => {
  const result = helpers.parseOssUploadError({ statusCode: 400, data: '<Error><Code>InvalidArgument</Code><Message><![CDATA[Bad <field>]]></Message><RequestId>request-123</RequestId><EC>0002-00000000</EC></Error>' })
  assert.equal(result.code, 'InvalidArgument')
  assert.equal(result.ossMessage, 'Bad <field>')
  assert.equal(result.requestId, 'request-123')
  assert.equal(result.ec, '0002-00000000')
  assert.equal(result.message, result.errMsg)
  assert.match(result.errMsg, /400.*InvalidArgument/)
  assert.equal(helpers.parseOssUploadError({ statusCode: 400, data: '<Message>A &amp; B</Message>' }).ossMessage, 'A & B')
  assert.match(helpers.parseOssUploadError({ statusCode: 502, data: 'upstream error' }).errMsg, /502/)
})

function loadComponent(policy) {
  let uploadOptions
  let onError
  let onSuccess
  const errors = []
  const componentSource = readFileSync(resolve(__dirname, '../src/components/su/SuUpload/index.vue'), 'utf8')
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const api = loadTs(componentSource + '\nexports.testUpload = customUpload;', {
    require(name) {
      if (name === './ossUpload') return helpers
      if (name === '@/api/common/oss') return { getUploadPolicyApi: async () => policy }
      throw new Error(`Unexpected runtime import: ${name}`)
    },
    console: { log() {}, error(...args) { errors.push(args) } },
    defineOptions() {}, defineProps: () => ({ category: 'food' }),
    withDefaults: (props, defaults) => ({ ...defaults, ...props }), defineEmits: () => () => {}, defineExpose() {},
    ref: (value) => ({ value }), watch() {}, computed: (get) => ({ get value() { return get() } }),
    uni: { ...uniBase64, uploadFile(options) { uploadOptions = options; return { onProgressUpdate() {} } } }
  })
  return {
    errors,
    async upload() {
      api.testUpload({ uid: 1, name: 'test.jpg', url: 'wxfile://tmp/test.jpg', size: 20 }, {}, {
        onError(value) { onError = value }, onSuccess(value) { onSuccess = value }, onProgress() {}
      })
      await new Promise(setImmediate)
      return uploadOptions
    },
    get error() { return onError }, get success() { return onSuccess }
  }
}

test('customUpload sends multipart without overriding HTTP Content-Type', async () => {
  const component = loadComponent(makePolicy([['eq', '$success_action_status', '201']]))
  const request = await component.upload()
  assert.equal(request.name, 'file')
  assert.equal(request.filePath, 'wxfile://tmp/test.jpg')
  assert.equal(request.formData.success_action_status, '201')
  assert.equal(request.header, undefined)
  request.success({ statusCode: 201, data: '' })
  assert.equal(component.success.statusCode, 201)
})

test('customUpload preserves HTTP 400 error details for the fail event', async () => {
  const component = loadComponent(makePolicy())
  const request = await component.upload()
  request.success({ statusCode: 400, data: '<Error><Code>InvalidArgument</Code><Message>missing field</Message><RequestId>req</RequestId></Error>' })
  assert.equal(component.error.code, 'InvalidArgument')
  assert.equal(component.error.requestId, 'req')
  assert.equal(component.error.message, component.error.errMsg)
  assert.equal(component.errors.length, 1)
})

test('customUpload stops invalid credentials before contacting OSS', async () => {
  const component = loadComponent(makePolicy([], { signatureVersion: 'v4' }))
  assert.equal(await component.upload(), undefined)
  assert.match(component.error.errMsg, /OSS4-HMAC-SHA256/)
})
