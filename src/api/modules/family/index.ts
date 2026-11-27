import request from '@/api/service'
import type {
  FamilyForm,
  FamilyDetailResponse,
  FamilyMemberItem,
  FamilyAvatarRequest,
  FamilyAvatarResponse,
  InvitationCodeResponse,
  InvitationDetailRequest,
  InvitationDetailResponse,
  JoinFamilyRequest,
  JoinFamilyResponse
} from '@/api/modules/family/types'

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
 * 获取家庭成员列表
 * @returns
 */
export const getFamilyMemberListApi = (id: number): Promise<FamilyMemberItem[]> => {
  return request<FamilyMemberItem[]>({
    url: '/api/family/getMemberList/' + id,
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

/**
 * 创建邀请码
 *
 * @param data
 */
export function createInvitationCodeApi() {
  return request<InvitationCodeResponse>({
    url: '/api/family/invitation/create',
    method: 'POST'
  })
}

/**
 * 获取邀请信息
 *
 * @param data
 */
export function getInvitationDetailApi(data: InvitationDetailRequest) {
  return request<InvitationDetailResponse>({
    url: '/api/family/invitation/getDetail',
    method: 'POST',
    data: data
  })
}

/**
 * 加入家庭
 *
 * @param data
 */
export function joinFamilyApi(data: JoinFamilyRequest): Promise<JoinFamilyResponse> {
  return request<JoinFamilyResponse>({
    url: '/api/family/invitation/join',
    method: 'POST',
    data: data
  })
}
