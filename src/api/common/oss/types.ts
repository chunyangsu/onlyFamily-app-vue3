/**
 * OSS 上传凭证请求参数
 */
export interface UploadPolicyRequest {
  category: 'avatar' | 'food' | 'attachment' // 上传业务分类，用于限制对象存储路径
  contentType: 'image/jpeg' | 'image/png' | 'image/webp' // 文件 MIME 类型，例如 image/jpeg
}

/**
 * OSS V4 PostObject 上传凭证响应
 * 对应后端响应 data 字段
 */
export interface UploadPolicyResponse {
  host: string // PostObject上传地址
  // bucket: string // Bucket名称
  // region: string // Region
  objectKey: string // 对象Key
  policy: string // Base64编码的上传Policy
  signature: string // V4签名
  signatureVersion: string // 签名算法版本
  credential: string // 临时凭证标识
  date: string // V4签名日期
  securityToken?: string // 使用 STS 临时凭证时必填；长期凭证签名时不传
  // contentType: string // 本次上传允许的 Content-Type
  // maxFileSize: number // 单个文件允许的最大字节数
  // expiration: string // 凭证过期时间
  // successActionStatus?: 200 | 201 | 204 // 必须与签名 policy 条件一致；未返回时从 policy 读取
}
