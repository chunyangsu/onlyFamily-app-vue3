// 登录表单
export interface LoginForm {
  code: string // 微信登录临时授权凭证
  // mobile: string // 手机号
  // password: string // 密码
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
