import request from '@/api/service'
import type { AddAttachmentRequestItem, AddAttachmentResponseItem } from '@/api/common/attachment/types'

/**
 * 获取附件列表
 * @returns
 */
// export const getDishListApi = () => {
//   return request({
//     url: '/api/dish/getList',
//     method: 'GET'
//   })
// }

/**
 * 添加附件
 *
 * @param data
 */
export function addAttachmentApi(attachmentArr: AddAttachmentRequestItem[]): Promise<AddAttachmentResponseItem[]> {
  return request<AddAttachmentResponseItem[]>({
    url: '/api/attachment/add',
    method: 'POST',
    data: { attachmentArr }
  })
}
