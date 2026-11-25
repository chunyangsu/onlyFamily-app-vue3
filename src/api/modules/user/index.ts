import request from '@/api/service'
import type { LoginRequest, LoginResponse, UserAvatarRequest, UserAvatarResponse, UserNicknameRequest, UserNicknameResponse } from '@/api/modules/user/types'

/**
 * 登录
 * @returns
 */
export const loginApi = (data: LoginRequest): Promise<LoginResponse> => {
  return request<LoginResponse>({
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

/**
 * 更新用户昵称
 * @returns
 */
export const updateUserNicknameApi = (data: UserNicknameRequest): Promise<UserNicknameResponse> => {
  return request<UserNicknameResponse>({
    url: '/api/user/updateNickname',
    method: 'PUT',
    data: data
  })
}
