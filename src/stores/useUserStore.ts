import { defineStore } from 'pinia'
// api
import { loginApi } from '@/api/modules/user'
// ts
import type { LoginForm } from '@/api/modules/user/types'
// utils
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo } from '@/utils/user'

interface UserInfo {
  id: number
  name: string
  familyId: number // 所属家庭
}

export const useUserStore = defineStore('user', () => {
  // token
  const token = ref('')
  // 用户信息
  const userInfo = ref<UserInfo>({
    id: 0,
    name: '',
    familyId: 0
  })

  // 登录
  const login = async () => {
    // 1. 获取微信登录凭证
    const loginResult = await uni.login({
      provider: 'weixin'
    })
    if (!loginResult.code) {
      throw new Error('获取微信登录凭证失败')
    }

    // 2. 调用后端微信登录接口
    const params: LoginForm = {
      code: loginResult.code
    }
    const response = await loginApi(params)

    if (!response.token || !response.userInfo.id) {
      throw new Error('登录响应数据异常')
    }
    // 更新缓存中的状态
    token.value = response.token
    userInfo.value = {
      id: response.userInfo.id,
      name: response.userInfo.name,
      familyId: 1
    }
    setToken(token.value)
    setUserInfo(userInfo.value)
  }

  // 退出登录
  const logout = () => {
    resetUserStore()
    uni.reLaunch({
      url: '/pages/login/index'
    })
  }

  // 重置(清空)用户状态
  const resetUserStore = () => {
    removeToken()
    removeUserInfo()

    token.value = ''
    userInfo.value = {
      id: 0,
      name: '',
      familyId: 0
    }
  }

  // 初始化登录状态
  const initUserStore = async (): Promise<void> => {
    const cacheToken = getToken()
    if (!cacheToken) {
      resetUserStore()
      return
    }
    token.value = cacheToken

    const cacheUserInfo = getUserInfo()
    if (!cacheUserInfo) {
      resetUserStore()
      return
    }
    userInfo.value = cacheUserInfo
    // todo:通过后端验证 Token
    // try {
    //   const userInfo = await getUserProfileApi()
    //   userState.userInfo = userInfo
    //   userState.isLoggedIn = true
    //   setUserInfo(userInfo)
    // } catch (error) {
    //   // Token 无效、过期或用户状态异常
    //   resetUserState()
    // } finally {
    //   userState.isReady = true
    // }
  }

  return { token, userInfo, login, logout, initUserStore }
})
