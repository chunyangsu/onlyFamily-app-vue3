import request from '@/api/service'
import type { FamilyForm, FamilyDetailResponse, FamilyAvatarRequest, FamilyAvatarResponse } from '@/api/modules/family/types'

/**
 * 获取菜品列表
 * @returns
 */
// export const getFamilyListApi = () => {
//   return request({
//     url: '/api/family/getList',
//     method: 'GET'
//   })
// }

/**
 * 新建家庭
 *
 * @param data
 */
export function createFamilyApi(data: FamilyForm) {
  return request({
    url: '/api/family/create',
    method: 'POST',
    data: data
  })
}

/**
 * 获取家庭详情
 * @returns
 */
export const getFamilyDetailApi = (id: number): Promise<FamilyDetailResponse> => {
  return request<FamilyDetailResponse>({
    url: '/api/family/getDetail/' + id,
    method: 'GET'
  })
}

/**
 * 更新家庭头像
 * @returns
 */
export const updateFamilyAvatarApi = (data: FamilyAvatarRequest): Promise<FamilyAvatarResponse> => {
  return request<FamilyAvatarResponse>({
    url: '/api/family/updateAvatar',
    method: 'PUT',
    data: data
  })
}
