import request from '@/api/service'
import type { AddAttachmentItem } from '@/api/common/attachment/types'

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
export function addAttachmentApi(attachmentArr: AddAttachmentItem[]) {
  return request({
    url: '/api/attachment/add',
    method: 'POST',
    data: { attachmentArr }
  })
}
