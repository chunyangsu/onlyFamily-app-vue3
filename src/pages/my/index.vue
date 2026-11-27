<template>
  <view class="su-container my-container">
    <view class="bg-img">
      <!-- <SuImage name="my-bg.webp" /> -->
    </view>
    <view class="content">
      <view class="card-item">
        <!-- <SuCard hide-header> -->
        <view class="user-profile">
          <view class="avatar-area">
            <SuAvatar :id="userStore.userInfo.avatarId" :src="userStore.userInfo.avatarUrl" :expires-time="userStore.userInfo.expiresTime" refresh-expires-time @refresh="userStore.updateUserAvatar" />
          </view>
          <view class="user-info">
            <view class="nickname">{{ userStore.userInfo.nickname }}</view>
            <!-- <view class="mobile">手机号：13057160969</view> -->
          </view>
          <view class="setting-btn" @click="goToPersonalProfile">
            <SuImage name="my-setting.webp" />
          </view>
        </view>
        <!-- </SuCard> -->
      </view>
      <!-- 家庭管理 -->
      <view class="card-item">
        <SuCard hide-header>
          <view class="family">
            <view class="f-header">
              <view class="f-icon">
                <SuImage v-if="userStore.familyInfo.avatarId > 0" :src="userStore.familyInfo.avatarUrl" />
                <SuImage v-else name="family-home.webp" />
              </view>
              <view class="f-content">
                <view class="f-name">{{ userStore.familyInfo.name }}</view>
                <view class="member-num">成员：{{ userStore.familyInfo.memberNum }}人</view>
              </view>
              <view v-if="userStore.userInfo.role === 'admin'" class="f-edit" @click="goToFamilyManage">
                <view class="f-role">管理员</view>
                <view class="f-arrow">
                  <wd-icon name="right" size="32rpx" />
                </view>
              </view>
            </view>
            <view class="nav-menu">
              <view class="nav-item">
                <view class="nav-icon">
                  <view class="h-42rpx m-t-6rpx">
                    <SuImage name="family-members.webp" />
                  </view>
                </view>
                <view class="nav-name">成员管理</view>
              </view>
              <view class="nav-item" @click="inviteMember">
                <view class="nav-icon">
                  <SuImage name="family-invite.webp" />
                </view>
                <view class="nav-name">{{ isCreatingInvitation ? '创建中...' : '邀请成员' }}</view>
              </view>
              <view class="nav-item" @click="createFamily">
                <view class="nav-icon">
                  <SuImage name="family-create.webp" />
                </view>
                <view class="nav-name">创建家庭</view>
              </view>
              <view class="nav-item">
                <view class="nav-icon">
                  <SuImage name="family-switch.webp" />
                </view>
                <view class="nav-name">我的家庭</view>
              </view>
            </view>
          </view>
        </SuCard>
      </view>
      <!-- 我的管理 -->
      <view class="card-item">
        <SuCard title="我的管理">
          <view class="manage">
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="chef-hat.webp" />
                </view>
              </view>
              <view class="item-name">我的菜谱</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-50rpx h-44rpx">
                  <SuImage name="favorite.webp" />
                </view>
              </view>
              <view class="item-name">我的收藏</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="order.webp" />
                </view>
              </view>
              <view class="item-name">我的订单</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
        </SuCard>
      </view>
      <!-- 其他设置 -->
      <view class="card-item">
        <SuCard title="其他设置">
          <view class="setting">
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="notification.webp" />
                </view>
              </view>
              <view class="item-name">消息通知</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-54rpx">
                  <SuImage name="security.webp" />
                </view>
              </view>
              <view class="item-name">隐私与账号安全</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="policy.webp" />
                </view>
              </view>
              <view class="item-name">用户服务协议与隐私政策</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-52rpx h-48rpx">
                  <SuImage name="feedback.webp" />
                </view>
              </view>
              <view class="item-name">意见反馈</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
            <view class="list-item">
              <view class="item-left">
                <view class="item-icon w-48rpx h-48rpx">
                  <SuImage name="about.webp" />
                </view>
              </view>
              <view class="item-name">关于 OnlyFamily</view>
              <view class="item-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
        </SuCard>
      </view>
    </view>
    <!-- 创建成功后展示原生分享按钮，由用户再次点击触发微信分享。 -->
    <wd-popup v-model="showInvitationPopup" position="center" closable round>
      <view class="invitation-popup">
        <view class="invitation-title">邀请成员</view>
        <view class="invitation-family">{{ invitationFamilyName }}</view>
        <view class="invitation-tip">邀请已准备好，分享给好友后，对方可确认加入家庭。</view>
        <view class="invitation-expiry">{{ invitationExpired ? '邀请已过期，请重新创建' : `有效期至 ${invitationExpiresText}` }}</view>
        <view class="invitation-tip">每份邀请仅限一位新成员使用，请勿公开转发。</view>
        <!-- #ifdef MP-WEIXIN -->
        <button id="family-invitation-share" class="invitation-share" :open-type="canShareInvitation ? 'share' : undefined" :disabled="!canShareInvitation">分享给好友</button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="invitation-tip">请在微信小程序中分享邀请。</view>
        <!-- #endif -->
        <button class="invitation-cancel" @click="showInvitationPopup = false">关闭</button>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
// api
import { createInvitationCodeApi } from '@/api/modules/family'
// ts
import type { InvitationCodeResponse } from '@/api/modules/family/types'
// utils

const userStore = useUserStore()

const isCreatingInvitation = ref(false)
const showInvitationPopup = ref(false)
const invitation = ref<InvitationCodeResponse | null>(null)
const invitationFamilyId = ref(0)
const invitationFamilyName = ref('')
const invitationExpired = ref(true)
let invitationExpiryTimer: ReturnType<typeof setTimeout> | undefined

const canShareInvitation = computed(() => !!invitation.value && !invitationExpired.value && invitationFamilyId.value === userStore.userInfo.familyId)
const invitationExpiresText = computed(() => {
  if (!invitation.value) return ''
  const date = new Date(invitation.value.expiresTime)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
})

// 长期停留或从后台恢复时禁用过期邀请；原始凭证仅保存在页面内存。
const refreshInvitationExpiry = () => {
  clearTimeout(invitationExpiryTimer)
  const remaining = (invitation.value?.expiresTime ?? 0) - Date.now()
  invitationExpired.value = remaining <= 0
  if (remaining > 0) {
    invitationExpiryTimer = setTimeout(refreshInvitationExpiry, Math.min(remaining, 2147483647))
  }
}

// 家庭或账号变化后，清理旧邀请码并忽略旧请求
let invitationRequestVersion = 0
watch([() => userStore.userInfo.id, () => userStore.userInfo.familyId], () => {
  invitationRequestVersion++
  showInvitationPopup.value = false
  invitation.value = null
  refreshInvitationExpiry()
})

// 跳转"个人资料"页面
const goToPersonalProfile = () => {
  uni.navigateTo({
    url: '/views/my/personalProfile/index'
  })
}

// 跳转"家庭管理"页面
const goToFamilyManage = () => {
  uni.navigateTo({
    url: '/views/my/familyManage/index'
  })
}

/**
 * 邀请成员：防重复请求 → 创建邀请码 → 校验响应 → 展示分享弹窗。
 * 不在异步请求后主动拉起微信分享，由原生按钮触发 onShareAppMessage。
 * 创建失败不展示弹窗，service 已提示的业务/网络错误不重复 Toast。
 */
const inviteMember = async () => {
  if (isCreatingInvitation.value) return
  const familyId = userStore.userInfo.familyId
  if (!familyId || familyId !== userStore.familyInfo.id) {
    uni.showToast({ title: '请先选择家庭并加载家庭信息', icon: 'none' })
    return
  }

  isCreatingInvitation.value = true
  showInvitationPopup.value = false
  invitation.value = null
  refreshInvitationExpiry()
  const requestVersion = ++invitationRequestVersion
  const familyName = userStore.familyInfo.name
  try {
    const response = await createInvitationCodeApi()
    // 切换家庭、账号或卸载页面后，忽略旧请求的响应。
    if (requestVersion !== invitationRequestVersion) return
    if (!response || !/^[A-Za-z0-9_-]{43}$/.test(response.invitationCode) || !Number.isFinite(response.expiresTime) || response.expiresTime <= Date.now()) {
      throw new Error('邀请码数据异常或已过期，请重试')
    }
    invitation.value = response
    invitationFamilyId.value = familyId
    invitationFamilyName.value = familyName
    refreshInvitationExpiry()
    showInvitationPopup.value = true
  } catch (error) {
    if (requestVersion !== invitationRequestVersion) return
    const detail = error as { statusCode?: number; code?: number; msg?: string; errMsg?: string }
    // 401、业务错误和网络错误由 service 提示；补齐其他 HTTP 错误和本地异常。
    if (detail?.statusCode === 401) return
    if (detail?.statusCode || error instanceof Error || (detail?.code === undefined && !detail?.errMsg)) {
      uni.showToast({ title: detail?.msg || (error instanceof Error ? error.message : '创建邀请失败，请稍后重试'), icon: 'none' })
    }
  } finally {
    isCreatingInvitation.value = false
  }
}

// 仅专用按钮携带邀请码，右上角普通分享不泄露邀请凭证。
onShareAppMessage((options) => {
  if (options.from === 'button' && options.target?.id === 'family-invitation-share') {
    refreshInvitationExpiry()
    if (canShareInvitation.value && invitation.value) {
      return {
        title: `邀请你加入「${invitationFamilyName.value}」`,
        // 接收方页面和路由留待下一步实现，先约定分享入口。
        path: `/views/my/joinFamily/index?invitationCode=${encodeURIComponent(invitation.value.invitationCode)}`,
        imageUrl: 'https://only-family-static.oss-cn-shanghai.aliyuncs.com/family-invitation-share.webp'
      }
    }
    uni.showToast({ title: '邀请已失效，请重新创建', icon: 'none' })
  }
  return { title: 'OnlyFamily，和家人共享美好生活', path: '/pages/home/index' }
})

onUnload(() => {
  invitationRequestVersion++
  clearTimeout(invitationExpiryTimer)
})

// 新建家庭
const createFamily = () => {
  // const params: FamilyForm = {
  //   name: '苏春阳的家庭',
  //   introduction: '昵称是狗窝'
  // }
  // createFamilyApi(params).then((response) => { })
}

onShow(async () => {
  refreshInvitationExpiry()
  console.log(userStore.familyInfo)
})
</script>

<style lang="scss" scoped>
.invitation-popup {
  box-sizing: border-box;
  width: 620rpx;
  padding: 56rpx 40rpx 32rpx;
  text-align: center;
  background-color: $pageBg;

  .invitation-title {
    color: $textDefault;
    font-size: 36rpx;
    font-weight: bold;
  }

  .invitation-family {
    margin-top: 24rpx;
    color: $sub;
    font-size: 32rpx;
    word-break: break-all;
  }

  .invitation-tip,
  .invitation-expiry {
    margin-top: 20rpx;
    color: $textLight;
    font-size: 26rpx;
    line-height: 1.6;
  }

  .invitation-expiry {
    color: $textDefault;
  }

  button {
    border-radius: 44rpx;
    font-size: 30rpx;

    &::after {
      border: none;
    }
  }

  .invitation-share {
    margin-top: 32rpx;
    color: #fff;
    background-color: $theme;

    &[disabled] {
      color: $textLight;
      background-color: $line;
    }
  }

  .invitation-cancel {
    margin-top: 16rpx;
    color: $textLight;
    background-color: transparent;
  }
}

.my-container {
  position: relative;
  min-height: 100vh;
  padding: 0 24rpx;
  padding-bottom: 24rpx;

  .bg-img {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }
}

.content {
  .card-item {
    margin-bottom: 24rpx;
  }

  // 用户资料
  .user-profile {
    display: flex;
    align-items: center;

    .avatar-area {
      width: 110rpx;
      height: 110rpx;
    }

    .user-info {
      flex: 1;
      margin-left: 24rpx;

      .nickname {
        color: $textDefault;
        font-size: 34rpx;
        font-weight: bold;
      }

      .mobile {
        color: $textLight;
        margin-top: 6rpx;
      }
    }

    .setting-btn {
      width: 40rpx;
      height: 40rpx;
      margin-right: 16rpx;
    }
  }

  // 家庭管理
  .family {
    .f-header {
      display: flex;

      .f-icon {
        width: 90rpx;
        height: 90rpx;
        border-radius: 12rpx;
        overflow: hidden;
      }

      .f-content {
        flex: 1;
        margin-left: 24rpx;

        .f-name {
          color: $textDefault;
          font-size: 32rpx;
          font-weight: bold;
        }

        .member-num {
          color: $textLight;
        }
      }

      .f-edit {
        display: flex;
        align-items: center;

        .f-role {
          width: 124rpx;
          height: 56rpx;
          line-height: 52rpx;
          text-align: center;
          border-radius: 28rpx;
          color: #61785b;
          background-color: #e8eddf;
        }

        .f-arrow {
          display: flex;
          margin-left: 8rpx;
          color: $textLight;
        }
      }
    }

    .nav-menu {
      display: flex;
      background-color: $pageBg;
      margin-top: 12rpx;

      .nav-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20rpx 0;

        .nav-icon {
          width: 50rpx;
          height: 50rpx;
        }

        .nav-name {
          color: $textLight;
          margin-top: 8rpx;
        }
      }
    }
  }

  // 我的管理
  .manage {
  }

  // 其他设置
  .setting {
  }

  // 列表行(通用)
  .list-item {
    display: flex;
    align-items: center;
    height: 80rpx;
    border-top: 2rpx solid $line;

    .item-left {
      width: 60rpx;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;

      .item-icon {
        // width: 48rpx;
        // height: 48rpx;
      }
    }

    .item-name {
      flex: 1;
      margin-left: 24rpx;
    }

    .item-arrow {
      display: flex;
      color: $textLight;
    }
  }
}
</style>
