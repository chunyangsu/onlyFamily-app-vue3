// 家庭表单
export interface FamilyForm {
  name: string // 名称
  introduction: string // 介绍
}

// 家庭详情
export interface FamilyDetailResponse {
  id: 0
  name: ''
  avatarId: 0
  avatarUrl: ''
}

// 家庭成员
export interface FamilyMemberItem {
  id: 0
  nickname: ''
  avatarId: 0
  avatarUrl: ''
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
