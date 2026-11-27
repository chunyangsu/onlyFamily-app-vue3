<template>
  <view class="su-container join-family">
    <!-- 家庭图片 -->
    <view class="logo">
      <SuImage name="invitation-join-logo.webp" />
    </view>
    <view v-if="loading">正在获取邀请信息...</view>
    <view v-else-if="errorMsg">{{ errorMsg }}</view>
    <!-- 邀请信息 -->
    <view v-if="formData.familyId > 0" class="main">
      <view class="family-avatar">
        <SuImage v-if="formData.familyAvatarId > 0" :src="formData.familyAvatarUrl" />
        <SuImage v-else name="family-home.webp" />
      </view>
      <view class="divider" />
      <view class="invitation-info">
        <view class="family-name">{{ formData.familyName }}</view>
        <view class="inviter-info">
          <view class="inviter-avatar">
            <SuAvatar :id="formData.inviterAvatarId" :src="formData.inviterAvatarUrl" />
          </view>
          <view class="inviter-name">邀请人：{{ formData.inviterNickname }}</view>
        </view>
      </view>
    </view>
    <!-- 加入按钮 -->
    <view class="btn-area">
      <view v-if="joinErrorMsg">{{ joinErrorMsg }}</view>
      <button class="join-btn" :loading="joining" :disabled="loading || joining || invitationUnavailable || !formData.familyId" @click="joinFamily">
        {{ joinedFamily ? '进入家庭' : formData.isMember ? '已是成员，进入家庭' : '确认加入' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
// api
import { getInvitationDetailApi, joinFamilyApi } from '@/api/modules/family'
// ts
import type { InvitationDetailRequest, InvitationDetailResponse, JoinFamilyResponse } from '@/api/modules/family/types'
// utils
import { getFamilyInvitation, setFamilyInvitation, removeFamilyInvitation } from '@/utils/user'

const userStore = useUserStore()
const loading = ref(false)
const errorMsg = ref('')
const joining = ref(false)
const joinErrorMsg = ref('')
const invitationUnavailable = ref(false)
// 已成功的加入结果留在内存，资料同步或跳转失败时不重复提交加入。
const joinedFamily = ref<JoinFamilyResponse | null>(null)

const formData = ref<InvitationDetailResponse>({
  inviterId: 0,
  inviterAvatarId: 0,
  inviterAvatarUrl: '',
  inviterNickname: '',
  familyId: 0,
  familyName: '',
  familyAvatarId: 0,
  familyAvatarUrl: '',
  status: '',
  expiresTime: 0,
  isMember: false
})

// 邀请码
const invitationCode = ref('')

/**
 * 获取邀请详情
 * 详情接口需要登录；邀请码已提前暂存，401 跳转登录后也不会丢失
 */
const getInvitationDetail = async () => {
  const params: InvitationDetailRequest = {
    invitationCode: invitationCode.value
  }
  loading.value = true
  errorMsg.value = ''
  try {
    formData.value = await getInvitationDetailApi(params)
  } catch (error) {
    const detail = error as { statusCode?: number; msg?: string; errMsg?: string }
    if (detail?.statusCode === 401) return
    errorMsg.value = detail?.msg || '获取邀请信息失败，请稍后重试'
    // 业务错误和网络错误由请求层提示，补齐其他 HTTP 错误的 Toast。
    if (detail?.statusCode) {
      uni.showToast({ title: errorMsg.value, icon: 'none' })
    }
    if ([403, 404, 409, 410].includes(detail?.statusCode ?? 0)) {
      invitationUnavailable.value = true
      removeFamilyInvitation()
    }
  } finally {
    loading.value = false
  }
}

/**
 * 用户确认加入：防重复提交，成功后同步当前家庭及成员资料，再重新进入首页。
 * 网络/服务异常保留邀请码，可直接重试加入，利用后端幂等处理，不强制重新预览。
 * 已是成员也通过加入接口重新确认资格，不修改其已有角色和资料。
 */
const joinFamily = async () => {
  if (loading.value || joining.value || invitationUnavailable.value || !formData.value.familyId) return
  joining.value = true
  joinErrorMsg.value = ''
  try {
    if (!joinedFamily.value) {
      try {
        joinedFamily.value = await joinFamilyApi({ invitationCode: invitationCode.value })
      } catch (error) {
        const detail = error as { statusCode?: number; msg?: string }
        if (detail?.statusCode === 401) return
        joinErrorMsg.value = detail?.msg || '加入结果未确认，请点击重试'
        // 业务错误和网络错误已有提示，补齐其他 HTTP 错误。
        if (detail?.statusCode) uni.showToast({ title: joinErrorMsg.value, icon: 'none' })
        if ([403, 404, 409, 410].includes(detail?.statusCode ?? 0)) {
          invitationUnavailable.value = true
          removeFamilyInvitation()
        }
        return
      }
    }

    // 从这里开始，后端已经确认加入成功；后续异常不能显示为“加入失败”
    let profileLoaded = false
    try {
      // 加入已确认，先清理已消费的邀请码，避免资料请求 401 后登录又恢复到失效邀请。
      removeFamilyInvitation()
      profileLoaded = await userStore.applyJoinedFamily(joinedFamily.value)
    } catch (error) {
      // 请求层已跳转登录，此处不能再提示同步失败或继续跳首页。
      if ((error as { statusCode?: number })?.statusCode === 401) return
      joinErrorMsg.value = '已加入家庭，本地信息同步失败，请点击重试'
      uni.showToast({ title: joinErrorMsg.value, icon: 'none' })
      return
    }
    const title = !profileLoaded ? '已加入家庭，成员资料暂未加载' : joinedFamily.value.alreadyMember ? '已进入家庭' : '加入家庭成功'
    // 重建页面，避免 tab 页和购物车继续保留原家庭的数据。
    uni.reLaunch({
      url: '/pages/home/index',
      success: () => uni.showToast({ title, icon: 'none' }),
      fail: () => {
        joinErrorMsg.value = '已加入家庭，跳转失败，请点击进入家庭重试'
        uni.showToast({ title: joinErrorMsg.value, icon: 'none' })
      }
    })
  } finally {
    joining.value = false
  }
}

onLoad(async (options) => {
  // 分享参数优先；无参数时允许从暂存的邀请码恢复
  const code = options?.invitationCode ?? getFamilyInvitation()
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(code)) {
    removeFamilyInvitation()
    errorMsg.value = '邀请码缺失或格式不正确'
    uni.showToast({ title: errorMsg.value, icon: 'none' })
    return
  }
  invitationCode.value = code
  setFamilyInvitation(code)
  await userStore.initUserStore()
  if (!userStore.token) {
    // 未登录，先进入登录页
    uni.reLaunch({ url: '/pages/login/index' })
    return
  }
  // 已登录，获取邀请信息详情
  await getInvitationDetail()
})
</script>

<style lang="scss" scoped>
.join-family {
  padding: 0 24rpx;
  padding-top: 150rpx;
  .logo {
    width: 100%;
    height: 400rpx;
  }
  .main {
    display: flex;
    border-radius: 24rpx;
    background-color: #fff;
    padding: 24rpx;
    .family-avatar {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      overflow: hidden;
    }
    .divider {
      width: 4rpx;
      height: 160rpx;
      background-color: #fdd69e;
      margin: 8rpx 24rpx;
    }
    .invitation-info {
      .family-name {
        color: $textDefault;
        font-size: 40rpx;
        font-weight: bold;
      }
      .inviter-info {
        display: flex;
        align-items: center;
        margin-top: 20rpx;
        .inviter-avatar {
          width: 80rpx;
          height: 80rpx;
        }
        .inviter-name {
          margin-left: 24rpx;
          color: #666;
          margin-left: 24rpx;
          font-size: 32rpx;
        }
      }
    }
  }
  .btn-area {
    margin-top: 40rpx;
    display: flex;
    justify-content: center;
    .join-btn {
      background-color: $theme;
      color: #fff;
      border-radius: 60rpx;
      font-size: 45rpx;
      font-weight: bold;
      padding: 0rpx 100rpx;
    }
  }
}
</style>
