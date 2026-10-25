// 附件表单
// export interface DishForm {
//   name: string // 名称
//   categoryId: number // 分类id
//   introduction: string // 介绍
//   makeProcess: string // 制作过程
//   price: string // 价格
// }

// 添加附件的请求参数字段
export interface AddAttachmentItem {
  name: string // 附件名称
  category: string // 业务分类
  objectKey: string // OSS对象key
}
