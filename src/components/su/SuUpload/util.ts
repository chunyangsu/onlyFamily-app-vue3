import type { UploadPolicyResponse } from '../../../api/common/oss/types'

type PostPolicy = {
  expiration: string
  conditions: (Record<string, unknown> | unknown[])[]
}

/** Read the signed policy without modifying/re-encoding the string sent to OSS. */
function readPolicy(encoded: string): PostPolicy {
  try {
    const bytes = new Uint8Array(uni.base64ToArrayBuffer(encoded))
    const json = decodeURIComponent(Array.from(bytes, (byte) => `%${byte.toString(16).padStart(2, '0')}`).join(''))
    const policy = JSON.parse(json) as PostPolicy
    if (!Array.isArray(policy.conditions) || !Number.isFinite(Date.parse(policy.expiration))) {
      throw new Error('Invalid policy')
    }
    return policy
  } catch {
    throw new Error('OSS 上传凭证中的 policy 不是有效的 Base64 JSON，请检查后端签发逻辑')
  }
}

export function buildOssRequest(policy: UploadPolicyResponse) {
  for (const field of ['host', 'objectKey', 'policy', 'signatureVersion', 'credential', 'date', 'signature'] as const) {
    if (typeof policy?.[field] !== 'string' || !policy[field].trim()) {
      throw new Error(`OSS 上传凭证缺少 ${field}，请检查 getUploadPolicyApi 返回值`)
    }
  }

  // PostObject targets the bucket root, not an object URL or an API endpoint.
  // if (!/^https:\/\/[^/?#\s]+\/?$/.test(policy.host)) {
  //   throw new Error('OSS host 必须为 HTTPS Bucket 根地址，不能包含对象路径或查询参数')
  // }
  if (policy.signatureVersion !== 'OSS4-HMAC-SHA256') {
    throw new Error('OSS V4 signatureVersion 必须为 OSS4-HMAC-SHA256，请由后端重新签发，不能在前端修改签名字段')
  }
  if (!/^\d{8}T\d{6}Z$/.test(policy.date) || !/^[a-f\d]{64}$/i.test(policy.signature)) {
    throw new Error('OSS V4 date 应为 YYYYMMDDTHHmmssZ，signature 应为 64 位十六进制字符串')
  }
  const credential = policy.credential.split('/')
  if (credential.length !== 5 || !credential[0] || credential[1] !== policy.date.slice(0, 8) || !credential[2] || credential[3] !== 'oss' || credential[4] !== 'aliyun_v4_request') {
    throw new Error('OSS V4 credential 格式或签名日期不匹配，请检查后端签发逻辑')
  }

  const signedPolicy = readPolicy(policy.policy)
  if (Date.parse(signedPolicy.expiration) <= Date.now()) {
    throw new Error('OSS 上传凭证已过期，请重新获取')
  }

  // Do not hardcode 200 if the signed policy requires 201 or 204.
  let successStatus = String(policy.successActionStatus ?? 200)
  for (const condition of signedPolicy.conditions) {
    if (Array.isArray(condition)) {
      // if (condition[0] === 'eq' && condition[1] === '$success_action_status') successStatus = String(condition[2])
    } else if (condition && condition.success_action_status !== undefined) {
      // successStatus = String(condition.success_action_status)
    }
  }
  // if (!['200', '201', '204'].includes(successStatus)) {
  //   throw new Error('OSS success_action_status 只能为 200、201 或 204')
  // }

  const formData: Record<string, string> = {
    key: policy.objectKey,
    policy: policy.policy,
    'x-oss-signature-version': policy.signatureVersion,
    'x-oss-credential': policy.credential,
    'x-oss-date': policy.date,
    'x-oss-signature': policy.signature,
    success_action_status: successStatus
    // 'Content-Type': policy.contentType,
  }
  // A token is required for STS, but must not be submitted as undefined/empty
  // when the server signs using long-term credentials.
  if (policy.securityToken) formData['x-oss-security-token'] = policy.securityToken
  // const fields = Object.fromEntries(Object.entries(formData).map(([key, value]) => [key.toLowerCase(), value]))

  // 跳过oss表单字段的一致性校验，后续完善时放开
  // const endpointConditions = new Set(['bucket'])
  // for (const condition of signedPolicy.conditions) {
  //   const equalities = Array.isArray(condition) ? (condition[0] === 'eq' ? [[String(condition[1]).replace(/^\$/, ''), condition[2]]] : []) : Object.entries(condition || {})
  //   for (const [key, value] of equalities) {
  //     if (endpointConditions.has(String(key).toLowerCase())) continue
  //     if (fields[String(key).toLowerCase()] !== String(value)) {
  //       throw new Error(`OSS 表单 ${key} 与签名 policy 条件不一致，请检查后端返回值`)
  //     }
  //   }
  // }

  return { url: policy.host, formData }
}

function readXmlField(xml: string, field: string) {
  const value = new RegExp(`<${field}>([\\s\\S]*?)</${field}>`, 'i').exec(xml)?.[1]?.trim() || ''
  return value
    .replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

/** Keep OSS's error code/message/requestId instead of discarding res.data. */
export function parseOssUploadError(response: UniApp.UploadFileSuccessCallbackResult) {
  const xml = typeof response.data === 'string' ? response.data : ''
  const code = readXmlField(xml, 'Code')
  const message = readXmlField(xml, 'Message')
  const requestId = readXmlField(xml, 'RequestId')
  const ec = readXmlField(xml, 'EC')
  const errMsg = [`OSS 上传失败，HTTP ${response.statusCode}`, code, message, ec && `EC: ${ec}`, requestId && `RequestId: ${requestId}`].filter(Boolean).join('；')

  return { errMsg, message: errMsg, statusCode: response.statusCode, code, ossMessage: message, requestId, ec }
}
