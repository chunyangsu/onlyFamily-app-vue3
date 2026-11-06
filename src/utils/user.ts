const tokenKey = 'token'
const userInfoKey = 'userInfo'

// 获取token
export const getToken = (): string => {
  return uni.getStorageSync(tokenKey) || ''
}

// 保存token
export const setToken = (token: string): void => {
  uni.setStorageSync(tokenKey, token)
}

// 清除token
export const removeToken = (): void => {
  uni.removeStorageSync(tokenKey)
}

// 获取用户信息
export const getUserInfo = () => {
  return uni.getStorageSync(userInfoKey) || null
}

// 保存用户信息
export const setUserInfo = <T>(userInfo: T): void => {
  uni.setStorageSync(userInfoKey, userInfo)
}

// 清除用户信息
export const removeUserInfo = (): void => {
  uni.removeStorageSync(userInfoKey)
}
