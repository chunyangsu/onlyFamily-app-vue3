import request from '@/api/service'
import type { LoginForm } from '@/api/modules/user/types'

/**
 * 获取用户列表
 * @returns
 */
export const loginApi = (data: LoginForm) => {
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
