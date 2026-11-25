// 家庭表单
export interface FamilyForm {
  name: string // 名称
  introduction: string // 介绍
}

// 家庭详情
export interface FamilyDetailResponse {
  id: number
  name: string
  avatarId: number
  avatarUrl: string
}

// 家庭成员
export interface FamilyMemberItem {
  id: number
  nickname: string
  avatarId: number
  avatarUrl: string
  urlExpiresAt: number | null
}

/**
 * 家庭头像
 */
// 请求参数
export interface FamilyAvatarRequest {
  avatarId: number
}

// 返回数据
export interface FamilyAvatarResponse {
  avatarId: number
  avatarUrl: string
}
