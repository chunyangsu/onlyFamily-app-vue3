const tokenKey = 'token'
const userInfoKey = 'userInfo'
const familyInfoKey = 'familyInfo'
const familyInvitationKey = 'familyInvitation'

/**
 * token
 */
// 获取
export const getToken = (): string => {
  return uni.getStorageSync(tokenKey) || ''
}

// 保存
export const setToken = (token: string): void => {
  uni.setStorageSync(tokenKey, token)
}

// 清除
export const removeToken = (): void => {
  uni.removeStorageSync(tokenKey)
}

/**
 * 用户信息
 */
// 获取
export const getUserInfo = () => {
  return uni.getStorageSync(userInfoKey) || null
}

// 保存
export const setUserInfo = <T>(userInfo: T): void => {
  uni.setStorageSync(userInfoKey, userInfo)
}

// 清除
export const removeUserInfo = (): void => {
  uni.removeStorageSync(userInfoKey)
}

/**
 * 当前家庭信息
 */
// 获取
export const getFamilyInfo = () => {
  return uni.getStorageSync(familyInfoKey) || null
}

// 保存
export const setFamilyInfo = <T>(familyInfo: T): void => {
  uni.setStorageSync(familyInfoKey, familyInfo)
}

// 清除
export const removeFamilyInfo = (): void => {
  uni.removeStorageSync(familyInfoKey)
}

/**
 * 家庭邀请
 */
// 获取
export const getFamilyInvitation = () => {
  return uni.getStorageSync(familyInvitationKey) || null
}

// 保存
export const setFamilyInvitation = <T>(familyInfo: T): void => {
  uni.setStorageSync(familyInvitationKey, familyInfo)
}

// 清除
export const removeFamilyInvitation = (): void => {
  uni.removeStorageSync(familyInvitationKey)
}
