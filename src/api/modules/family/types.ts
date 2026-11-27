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
  memberNum: number
}

// 家庭成员
export interface FamilyMemberItem {
  id: number
  nickname: string
  avatarId: number
  avatarUrl: string
  expiresTime: number | null
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

/**
 * 创建邀请码
 */
export interface InvitationCodeResponse {
  invitationId: number // 邀请链接id
  invitationCode: string // 邀请码
  expiresTime: number // 过期时间
}

/**
 * 获取邀请信息
 */
export interface InvitationDetailRequest {
  invitationCode: string //邀请码
}

export interface InvitationDetailResponse {
  inviterId: number
  inviterAvatarId: number
  inviterAvatarUrl: string
  inviterNickname: string
  familyId: number
  familyName: string
  familyAvatarId: number
  familyAvatarUrl: string
  status: string
  expiresTime: number
  isMember: boolean // 是否已是成员
}

/**
 * 加入家庭
 */
export interface JoinFamilyRequest {
  invitationCode: string //邀请码
}

export interface JoinFamilyResponse {
  id: number
  name: string
  avatarId: number
  avatarUrl: string
  expiresTime: number | null // 过期时间
  memberNum: number
  role: 'admin' | 'member'
  alreadyMember: boolean
}
