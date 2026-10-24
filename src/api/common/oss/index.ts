import request from '@/api/service'
import type { UploadPolicyRequest, UploadPolicyResponse } from '@/api/common/oss/types'

/**
 * 获取oss的临时上传凭证
 * 负责：
 * 1. 接收上传凭证
 * 2. 使用凭证完成 OSS 直传
 * @param params 上传凭证请求参数
 * @returns OSS 上传凭证数据
 */
export const getUploadPolicyApi = (params: UploadPolicyRequest): Promise<UploadPolicyResponse> => {
  return request<UploadPolicyResponse>({
    url: '/api/oss/getUploadPolicy',
    method: 'POST',
    data: params
  })
}
