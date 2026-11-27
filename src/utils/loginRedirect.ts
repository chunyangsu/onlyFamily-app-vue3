import { getToken, getUserInfo, getFamilyInvitation, removeFamilyInvitation } from '@/utils/user'

let redirecting: Promise<boolean> | null = null

/**
 * 登录后的唯一跳转入口：当前非登录页不打断；登录页优先恢复邀请，否则进入首页。
 * 跳转时读取最新缓存，只恢复固定邀请页，不接受外部传入任意返回地址。
 * 仅跳转不消费邀请码，401 再次登录时仍可恢复；并发调用共用一次跳转。
 */
export const redirectAfterLogin = (): Promise<boolean> => {
  const pages = getCurrentPages()
  if (pages[pages.length - 1]?.route !== 'pages/login/index' || !getToken() || !getUserInfo()?.id) {
    return Promise.resolve(false)
  }
  if (redirecting) return redirecting

  // 获取邀请码
  const code = getFamilyInvitation()
  const validCode = typeof code === 'string' && /^[A-Za-z0-9_-]{43}$/.test(code)
  if (code && !validCode) removeFamilyInvitation()
  // 有邀请码时跳转邀请页，没有则跳转首页
  const url = validCode ? `/views/my/joinFamily/index?invitationCode=${encodeURIComponent(code)}` : '/pages/home/index'
  redirecting = new Promise<boolean>((resolve) => {
    uni.reLaunch({
      url,
      success: () => resolve(true),
      fail: () => {
        uni.showToast({ title: '页面跳转失败，请重试', icon: 'none' })
        resolve(false)
      }
    })
  }).finally(() => {
    redirecting = null
  })
  return redirecting
}
