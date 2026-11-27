import { defineStore } from 'pinia'
// api
import { loginApi } from '@/api/modules/user'
import { getFamilyDetailApi, getFamilyMemberListApi } from '@/api/modules/family'
// ts
import type { LoginRequest, UserInfo, UserAvatarResponse, UserNicknameResponse } from '@/api/modules/user/types'
import type { FamilyAvatarResponse, JoinFamilyResponse } from '@/api/modules/family/types'
// utils
import { getToken, setToken, removeToken, getUserInfo, setUserInfo, removeUserInfo, getFamilyInfo, setFamilyInfo, removeFamilyInfo, removeFamilyInvitation } from '@/utils/user'

interface FamilyInfo {
  id: number
  name: string
  avatarId: number
  avatarUrl: string
  memberNum: number
}

export const useUserStore = defineStore('user', () => {
  // token
  const token = ref('')
  // 用户信息
  const userInfo = ref<UserInfo>({
    id: 0,
    familyId: 0,
    nickname: '',
    avatarId: 0,
    avatarUrl: '',
    expiresTime: null,
    role: 'member'
  })
  // 当前家庭信息
  const familyInfo = ref<FamilyInfo>({
    id: 0,
    name: '',
    avatarId: 0,
    avatarUrl: '',
    memberNum: 0
  })

  // 切换家庭或重置账号后，未完成的家庭详情请求不得再写入状态和缓存。
  let familyDetailRequestVersion = 0

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
    familyDetailRequestVersion++
    token.value = response.token
    userInfo.value = {
      id: response.userInfo.id,
      // 查询到用户有且仅有一个所属家庭时，会自动返回家庭id
      familyId: response.userInfo.familyId,
      nickname: response.userInfo.nickname,
      avatarId: response.userInfo.avatarId,
      avatarUrl: response.userInfo.avatarUrl,
      expiresTime: response.userInfo.expiresTime,
      role: response.userInfo.role
    }
    setToken(token.value)
    setUserInfo(userInfo.value)
    if (userInfo.value.familyId > 0) {
      void getFamilyDetail(userInfo.value.familyId).catch(() => {
        // 后台加载失败不阻塞登录；401 的登录跳转由请求层统一处理。
      })
    }
  }

  // 获取当前家庭详情
  const getFamilyDetail = async (id: number) => {
    const requestVersion = ++familyDetailRequestVersion
    const requestToken = token.value
    const requestUserId = userInfo.value.id
    const response = await getFamilyDetailApi(id)
    if (requestVersion !== familyDetailRequestVersion || token.value !== requestToken || userInfo.value.id !== requestUserId || userInfo.value.familyId !== id) return
    familyInfo.value = {
      id: response.id,
      name: response.name,
      avatarId: response.avatarId,
      avatarUrl: response.avatarUrl,
      memberNum: response.memberNum
    }
    setFamilyInfo(familyInfo.value)
  }

  // 加入已成功：先同步家庭 ID 和缓存，再读取该家庭的成员资料
  const applyJoinedFamily = async (data: JoinFamilyResponse): Promise<boolean> => {
    familyDetailRequestVersion++
    const sameFamily = userInfo.value.familyId === data.id
    const nextUserInfo = {
      ...userInfo.value,
      familyId: data.id,
      // 跨家庭时不能沿用旧家庭的昵称、头像。
      ...(!sameFamily ? { nickname: '', avatarId: 0, avatarUrl: '', expiresTime: null } : {})
    }
    const nextFamilyInfo = { id: data.id, name: data.name, avatarId: data.avatarId, avatarUrl: data.avatarUrl, memberNum: data.memberNum }
    setUserInfo(nextUserInfo)
    setFamilyInfo(nextFamilyInfo)
    userInfo.value = nextUserInfo
    familyInfo.value = nextFamilyInfo
    try {
      const members = await getFamilyMemberListApi(data.id)
      const member = members.find((item) => item.id === nextUserInfo.id)
      if (!member) return false
      const nextMemberInfo = { ...nextUserInfo, nickname: member.nickname, avatarId: member.avatarId, avatarUrl: member.avatarUrl, expiresTime: member.expiresTime }
      setUserInfo(nextMemberInfo)
      userInfo.value = nextMemberInfo
      return true
    } catch (error) {
      // 登录失效不能降级为普通资料加载失败，否则页面会继续跳首页覆盖登录跳转。
      if ((error as { statusCode?: number })?.statusCode === 401) throw error
      // 成员资料加载失败不回滚已成功的家庭切换，也不误报加入失败。
      return false
    }
  }

  // 绑定成功后同步头像，保留其他用户信息
  const updateUserAvatar = (data: UserAvatarResponse) => {
    if (!Number.isInteger(data.avatarId) || data.avatarId <= 0 || !data.avatarUrl?.trim()) {
      throw new Error('头像更新响应数据异常')
    }
    const tempUserInfo = { ...userInfo.value, avatarId: data.avatarId, avatarUrl: data.avatarUrl, expiresTime: data.expiresTime }
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
    // 主动退出才清理邀请，初始化未登录状态时仍保留待处理邀请码
    removeFamilyInvitation()
    resetUserStore()
    uni.reLaunch({
      url: '/pages/login/index'
    })
  }

  // 重置(清空)用户状态
  const resetUserStore = () => {
    familyDetailRequestVersion++
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
      expiresTime: null,
      role: 'member'
    }
    familyInfo.value = {
      id: 0,
      name: '',
      avatarId: 0,
      avatarUrl: '',
      memberNum: 0
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
    if (!cacheUserInfo) {
      resetUserStore()
      return
    }
    userInfo.value = cacheUserInfo
    // 新用户尚未加入家庭，或家庭信息尚未缓存，不代表登录失效。
    familyInfo.value = cacheUserInfo.familyId > 0 && cacheFamilyInfo?.id === cacheUserInfo.familyId ? cacheFamilyInfo : { id: 0, name: '', avatarId: 0, avatarUrl: '', memberNum: 0 }
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

  return { token, userInfo, familyInfo, login, logout, initUserStore, applyJoinedFamily, updateUserAvatar, updateUserNickname, updateFamilyAvatar }
})
