<template>
  <view class="su-container personal-profile">
    <view class="main">
      <view class="card-item">
        <view class="basic-info">
          <!-- 头像 -->
          <button class="row-item avatar-row" hover-class="none" :disabled="avatarBusy" open-type="chooseAvatar" @chooseavatar="handleChooseAvatar">
            <view class="item-left">头像</view>
            <view class="item-right">
              <view class="right-value">
                <view class="avatar-area">
                  <SuAvatar :id="userStore.userInfo.avatarId" :src="userStore.userInfo.avatarUrl" :expires-time="userStore.userInfo.expiresTime" @refresh="userStore.updateUserAvatar" />
                </view>
              </view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </button>
          <!-- 昵称 -->
          <view class="row-item" @click="updateNickname">
            <view class="item-left">昵称</view>
            <view class="item-right">
              <view class="right-value">{{ userStore.userInfo.nickname }}</view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
          <!-- 性别 -->
          <view class="row-item">
            <view class="item-left">性别</view>
            <view class="item-right">
              <view class="right-value no-set">未设置</view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
          <!-- 手机号 -->
          <view class="row-item">
            <view class="item-left">手机号</view>
            <view class="item-right">
              <view class="right-value no-set">未绑定</view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
          <!-- 邮箱 -->
          <view class="row-item">
            <view class="item-left">邮箱</view>
            <view class="item-right">
              <view class="right-value no-set">未绑定</view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 底部 -->
    <view class="footer">
      <view class="logout" @click="handleLogout">
        <view class="logout-icon">
          <SuImage name="logout.webp" />
        </view>
        <view class="logout-text">退出登录</view>
      </view>
    </view>
    <!-- 修改昵称弹窗 -->
    <wd-dialog selector="nickname">
      <view class="nickname-content">
        <SuInput v-model="nicknameDraft" placeholder="请输入昵称" />
      </view>
      <template #actions="{ confirm, cancel }">
        <view class="nickname-actions">
          <view class="nickname-action">
            <wd-button type="info" plain block :disabled="nicknameBusy" @click="cancel">取消</wd-button>
          </view>
          <view class="nickname-action">
            <wd-button block :loading="nicknameBusy" :disabled="nicknameBusy" @click="confirm">确定</wd-button>
          </view>
        </view>
      </template>
    </wd-dialog>
  </view>
</template>

<script setup lang="ts">
import { useDialog } from '@wot-ui/ui'
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
// api
import { updateUserAvatarApi, updateUserNicknameApi } from '@/api/modules/user'
// ts
// utils
import { getUploadErrorMessage, uploadAttachment } from '@/utils/upload'

const userStore = useUserStore()
const avatarBusy = ref(false)
const nicknameDialog = useDialog('nickname')
const nicknameDraft = ref('')
const nicknameBusy = ref(false)

const saveNickname = async () => {
  if (nicknameBusy.value) return false
  const nickname = nicknameDraft.value.trim()
  if (!nickname) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return false
  }
  const { id: userId, familyId } = userStore.userInfo
  const token = userStore.token
  nicknameBusy.value = true
  try {
    const result = await updateUserNicknameApi({ nickname })
    if (userStore.userInfo.id !== userId || userStore.userInfo.familyId !== familyId || userStore.token !== token) return true
    userStore.updateUserNickname(result)
    uni.showToast({ title: '昵称已更新', icon: 'success' })
    return true
  } catch (error) {
    uni.showToast({ title: getUploadErrorMessage(error, '修改昵称失败，请重试'), icon: 'none' })
    return false
  } finally {
    nicknameBusy.value = false
  }
}

const updateNickname = () => {
  if (nicknameBusy.value) return
  nicknameDraft.value = userStore.userInfo.nickname || ''
  nicknameDialog.confirm({ title: '修改昵称', beforeConfirm: saveNickname }).catch(() => {})
}

const uploadAvatarFile = async (filePath: string, size: number) => {
  if (size > 5 * 1024 * 1024) throw new Error('头像图片不能超过 5 MB')
  const { id: userId, familyId } = userStore.userInfo
  const token = userStore.token
  const sameSession = () => userStore.userInfo.id === userId && userStore.userInfo.familyId === familyId && userStore.token === token
  uni.showLoading({ title: '上传中...', mask: true })
  try {
    const attachment = await uploadAttachment({ filePath, module: 'user', moduleType: 'avatar' })
    if (!sameSession()) return
    uni.showLoading({ title: '保存中...', mask: true })
    const avatar = await updateUserAvatarApi({ avatarId: attachment.id })
    if (!sameSession()) return
    userStore.updateUserAvatar(avatar)
  } finally {
    uni.hideLoading()
  }
  uni.showToast({ title: '头像已更新', icon: 'success' })
}

const showAvatarError = (error: unknown) => {
  const message = getUploadErrorMessage(error, '选择或更新头像失败，请重试')
  if (!/cancel/i.test(message)) uni.showToast({ title: message, icon: 'none' })
}

// 选择用户头像
const handleChooseAvatar = async (event: unknown) => {
  const filePath = (event as { detail?: { avatarUrl?: string } })?.detail?.avatarUrl
  if (avatarBusy.value || !filePath) return
  avatarBusy.value = true
  try {
    // chooseAvatar 不返回大小，从临时文件读取后统一校验
    const { size } = await uni.getFileInfo({ filePath })
    await uploadAvatarFile(filePath, size)
  } catch (error) {
    showAvatarError(error)
  } finally {
    avatarBusy.value = false
  }
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
}
</script>

<style lang="scss" scoped>
.personal-profile {
  --wot-dialog-width: calc(100vw - 48rpx);
  --wot-dialog-radius: 24rpx;
  --wot-dialog-body-padding: 48rpx 32rpx 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0 24rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  .main {
    .card-item {
      background-color: #fff;
      border-radius: 24rpx;
      padding: 0 24rpx;
      margin-bottom: 24rpx;
    }

    // 列表行(通用)
    .row-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100rpx;
      border-top: 2rpx solid $line;
      font-size: 32rpx;
      .item-left {
        color: $textGrey;
      }
      .item-right {
        display: flex;
        align-items: center;
        .right-value {
          color: $textDefault;
        }
        .no-set {
          color: $textLight;
        }

        .right-arrow {
          display: flex;
          color: $textLight;
          margin-left: 24rpx;
        }
      }
    }
    .row-item:first-child {
      border-top: 0;
    }
    // 原生头像选择按钮沿用资料行布局，去掉按钮默认外观
    .avatar-row {
      width: 100%;
      margin: 0;
      padding: 0;
      border-radius: 0;
      background-color: transparent;
      font-weight: normal;
      line-height: normal;
      text-align: left;

      &::after {
        border: 0;
      }
    }
    .avatar-area {
      width: 70rpx;
      height: 70rpx;
    }
  }
  .footer {
    margin-top: auto;
    flex-shrink: 0;

    .logout {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e8eddf;
      padding: 18rpx 0;
      border-radius: 50rpx;

      .logout-icon {
        width: 36rpx;
        height: 34rpx;
      }

      .logout-text {
        color: $sub;
        font-size: 32rpx;
        margin-left: 12rpx;
      }
    }
  }

  .nickname-content {
    padding: 24rpx 0 40rpx;
    text-align: left;
  }

  .nickname-actions {
    --wot-button-primary-bg: #{$theme};
    --wot-button-primary-bg-active: #{$theme};
    --wot-button-info-plain-bg: #fff;
    --wot-button-info-plain-bg-active: #fff;
    --wot-button-info-plain-border: #{$line};
    --wot-button-info-color: #{$textDefault};
    display: flex;
    gap: 24rpx;
    padding: 0 32rpx 40rpx;

    .nickname-action {
      flex: 1;
      min-width: 0;
    }
  }
}
</style>
