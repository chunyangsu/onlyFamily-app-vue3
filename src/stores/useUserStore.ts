import { defineStore } from 'pinia'
// api
import { loginApi } from '@/api/modules/user'
import { getFamilyDetailApi } from '@/api/modules/family'
// ts
import type { LoginRequest, UserInfo, UserAvatarResponse, UserNicknameResponse } from '@/api/modules/user/types'
import type { FamilyAvatarResponse } from '@/api/modules/family/types'
// utils
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo, getFamilyInfo, setFamilyInfo, removeFamilyInfo } from '@/utils/user'

interface FamilyInfo {
  id: number
  name: string
  avatarId: number
  avatarUrl: string
}

export const useUserStore = defineStore('user', () => {
  // token
  const token = ref('')
  // 用户信息
  const userInfo = ref<UserInfo>({
    id: 0,
    nickname: '',
    familyId: 0,
    avatarId: 0,
    avatarUrl: '',
    urlExpiresAt: 0
  })
  // 当前家庭信息
  const familyInfo = ref<FamilyInfo>({
    id: 0,
    name: '',
    avatarId: 0,
    avatarUrl: ''
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
    const params: LoginRequest = {
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
      nickname: response.userInfo.nickname,
      // 查询到用户有且仅有一个所属家庭时，会自动返回家庭id
      familyId: response.userInfo.familyId,
      avatarId: response.userInfo.avatarId,
      avatarUrl: response.userInfo.avatarUrl,
      urlExpiresAt: response.userInfo.urlExpiresAt || 0
    }
    setToken(token.value)
    setUserInfo(userInfo.value)
    if (userInfo.value.familyId > 0) {
      getFamilyDetail(userInfo.value.familyId)
    }
  }

  // 获取当前家庭详情
  const getFamilyDetail = async (id: number) => {
    const response = await getFamilyDetailApi(id)
    familyInfo.value = {
      id: response.id,
      name: response.name,
      avatarId: response.avatarId,
      avatarUrl: response.avatarUrl
    }
    setFamilyInfo(familyInfo.value)
  }

  // 绑定成功后同步头像，保留其他用户信息
  const updateUserAvatar = (data: UserAvatarResponse) => {
    if (!Number.isInteger(data.avatarId) || data.avatarId <= 0 || !data.avatarUrl?.trim()) {
      throw new Error('头像更新响应数据异常')
    }
    const tempUserInfo = { ...userInfo.value, avatarId: data.avatarId, avatarUrl: data.avatarUrl, urlExpiresAt: data.urlExpiresAt }
    setUserInfo(tempUserInfo)
    userInfo.value = tempUserInfo
  }

  // 保存成功后同步昵称，保留头像等其他用户信息
  const updateUserNickname = (data: UserNicknameResponse) => {
    if (!data.nickname?.trim()) throw new Error('昵称更新响应数据异常')
    const tempUserInfo = { ...userInfo.value, nickname: data.nickname }
    setUserInfo(tempUserInfo)
    userInfo.value = tempUserInfo
  }

  // 绑定成功后同步家庭头像，保留家庭名称等信息
  const updateFamilyAvatar = (data: FamilyAvatarResponse) => {
    if (!Number.isInteger(data.avatarId) || data.avatarId <= 0 || !data.avatarUrl?.trim()) {
      throw new Error('家庭头像更新响应数据异常')
    }
    const tempFamilyInfo = { ...familyInfo.value, avatarId: data.avatarId, avatarUrl: data.avatarUrl }
    setFamilyInfo(tempFamilyInfo)
    familyInfo.value = tempFamilyInfo
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
    removeFamilyInfo()

    token.value = ''
    userInfo.value = {
      id: 0,
      nickname: '',
      familyId: 0,
      avatarId: 0,
      avatarUrl: '',
      urlExpiresAt: 0
    }
    familyInfo.value = {
      id: 0,
      name: '',
      avatarId: 0,
      avatarUrl: ''
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
    const cacheFamilyInfo = getFamilyInfo()
    if (!cacheUserInfo || !cacheFamilyInfo) {
      resetUserStore()
      return
    }
    userInfo.value = cacheUserInfo
    familyInfo.value = cacheFamilyInfo
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

  return { token, userInfo, familyInfo, login, logout, initUserStore, updateUserAvatar, updateUserNickname, updateFamilyAvatar }
})
