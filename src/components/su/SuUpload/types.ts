/**
 * 上传业务分类
 * 必须与后端 OSS 服务允许的 CATEGORIES 保持一致
 */
export type UploadCategory = 'avatar' | 'food' | 'attachment'

/**
 * 当前支持的文件类型
 * 一期先支持图片，后续可扩展 file、media 等类型
 */
export type UploadAccept = 'image'

/**
 * 文件上传状态
 */
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'failed'

/**
 * 上传成功或上传过程中的附件信息
 */
export interface AttachmentInfo {
  objectKey?: string // OSS对象存储路径(上传成功后才有值)
  url?: string // 可选访问地址，不保证OSS对象默认公开访问
  previewUrl?: string // 图片预览路径，可能是本地临时路径
  name: string // 文件名称
  size: number // 文件大小，单位：字节
  mimeType: string // 文件MIME类型
  status: UploadStatus // 当前上传状态
  attachmentId?: string // 后端附件记录 ID，接入附件管理接口后使用
  percent?: number // 上传进度，0-100
  uid?: number // 前端临时标识
  error?: string // 上传失败信息
}

/** 上传失败事件参数 */
export interface UploadFailEvent {
  file: AttachmentInfo
  error: unknown
}

/** 文件超出大小限制事件参数 */
export interface UploadOversizeEvent {
  file: AttachmentInfo
  maxSize: number
}

/** 文件数量超限事件参数 */
export interface UploadExceedEvent {
  file: AttachmentInfo
  maxCount: number
}

/**
 * 上传组件 Props
 */
export interface SuUploadProps {
  modelValue?: AttachmentInfo[]
  category: UploadCategory
  accept?: UploadAccept
  maxCount?: number
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  readonly?: boolean
  showUpload?: boolean
  deletable?: boolean
}

/**
 * 上传组件 Emits
 */
// export interface SuUploadEmits {
//   (event: 'update:modelValue', files: AttachmentInfo[]): void
//   (event: 'change', files: AttachmentInfo[]): void
//   (event: 'success', file: AttachmentInfo): void
//   (event: 'fail', payload: UploadFailEvent): void
//   (event: 'remove', file: AttachmentInfo): void
//   (event: 'oversize', file: AttachmentInfo): void
//   (event: 'exceed', file: AttachmentInfo): void
// }
