/**
 * 附件列表
 */

export interface AttachmentQuery {
  ids: string // 附件ids
}

export interface AttachmentItemResponse {
  id: number
  objectKey: string
  module: string
  moduleType: string
  url: string
  expiresTime: number | null // url地址过期时间
}

/**
 * 添加附件
 */
export interface AddAttachmentRequestItem {
  name: string // 附件名称(微信小程序获取不到名称，用作给后端数据库占位)
  module: string // 业务所属模块
  moduleType: string // 模块类型：avatar / dish
  mimeType: string // 文件MIME类型
  objectKey: string // OSS对象key
}

export interface AddAttachmentResponseItem {
  id: number // 附件id
  objectKey: string // OSS对象key
}
