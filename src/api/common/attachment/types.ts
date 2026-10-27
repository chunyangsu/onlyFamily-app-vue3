// 附件

export interface AttachmentQuery {
  // module: string // 业务模块
  idArr: number[] // 附件ids
}

// 添加附件的请求参数字段
export interface AddAttachmentRequestItem {
  name: string // 附件名称(微信小程序获取不到名称，用作给后端数据库占位)
  module: string // 业务所属模块
  mimeType: string // 文件MIME类型
  objectKey: string // OSS对象key
}

export interface AddAttachmentResponseItem {
  id: number // 附件id
  objectKey: string // OSS对象key
}
