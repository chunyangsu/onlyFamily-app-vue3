import request from '@/api/service'
import type { LoginForm, UserAvatarRequest, UserAvatarResponse } from '@/api/modules/user/types'

/**
 * 登录
 * @returns
 */
export const loginApi = (data: LoginForm): Promise<any> => {
  return request({
    url: '/api/user/login',
    method: 'POST',
    data: data
  })
}

/**
 * 获取用户列表
 * @returns
 */
export const getUserListApi = () => {
  return request({
    url: '/api/user/getList',
    method: 'GET'
  })
}

/**
 * 更新用户头像
 * @returns
 */
export const updateUserAvatarApi = (data: UserAvatarRequest): Promise<UserAvatarResponse> => {
  return request<UserAvatarResponse>({
    url: '/api/user/updateAvatar',
    method: 'PUT',
    data: data
  })
}
