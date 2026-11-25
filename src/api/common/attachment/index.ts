import request from '@/api/service'
import type { AttachmentQuery, AttachmentItemResponse, AddAttachmentRequestItem, AddAttachmentResponseItem } from '@/api/common/attachment/types'

/**
 * 获取附件列表
 * @returns
 */
export const getAttachmentListApi = (query: AttachmentQuery): Promise<AttachmentItemResponse[]> => {
  return request<AttachmentItemResponse[]>({
    url: '/api/attachment/getList',
    method: 'GET',
    data: query
  })
}

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
