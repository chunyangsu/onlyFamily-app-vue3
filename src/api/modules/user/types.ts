/**
 * 登录表单
 */

// 请求参数
export interface LoginRequest {
  code: string // 微信登录临时授权凭证
}
// 返回数据
export interface LoginResponse {
  token: string
  userInfo: UserInfo
}

export interface UserInfo {
  id: number
  nickname: string
  familyId: number // 所属家庭
  avatarId: number
  avatarUrl: string
  expiresTime: number | null // url地址过期时间
}

/**
 * 用户头像
 */
// 请求参数
export interface UserAvatarRequest {
  avatarId: number
}

// 返回数据
export interface UserAvatarResponse {
  avatarId: number
  avatarUrl: string
  expiresTime: number | null // url地址过期时间
}

/**
 * 用户昵称
 */
// 请求参数
export interface UserNicknameRequest {
  nickname: string
}

// 返回数据
export interface UserNicknameResponse {
  nickname: string
}
