<template>
  <view class="su-container personal-profile">
    <view class="main">
      <view class="card-item">
        <view class="basic-info">
          <!-- 头像 -->
          <view class="row-item" @click="updateAvatar">
            <view class="item-left">头像</view>
            <view class="item-right">
              <view class="right-value">
                <view class="avatar-area">
                  <view v-if="userStore.userInfo.avatarId > 0" class="w-100% h-100%">
                    <SuImage :src="userStore.userInfo.avatarUrl" />
                  </view>
                  <view v-else class="avatar-icon">
                    <SuImage name="avatar.webp" />
                  </view>
                </view>
              </view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
          <!-- 昵称 -->
          <view class="row-item">
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
    <!-- 更换头像：三种来源共用附件上传和头像绑定 -->
    <wd-action-sheet v-model="showAvatarSheet" title="更换头像" cancel-text="取消" :safe-area-inset-bottom="true">
      <view class="avatar-actions">
        <button class="avatar-action avatar-action--wechat" hover-class="avatar-action--pressed" :disabled="avatarBusy" open-type="chooseAvatar" @chooseavatar="handleChooseAvatar">
          使用微信头像
        </button>
        <button class="avatar-action" hover-class="avatar-action--pressed" :disabled="avatarBusy" @click="chooseAvatarImage('album')">从相册选择</button>
        <button class="avatar-action" hover-class="avatar-action--pressed" :disabled="avatarBusy" @click="chooseAvatarImage('camera')">拍照</button>
      </view>
    </wd-action-sheet>
  </view>
</template>

<script setup lang="ts">
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
// api
import { updateUserAvatarApi } from '@/api/modules/user'
// ts
// utils
import { getUploadErrorMessage, uploadAttachment } from '@/utils/upload'

interface AvatarMediaResult {
  tempFiles: { tempFilePath: string; size: number }[]
}

const userStore = useUserStore()
// 显示更换头像的操作层
const showAvatarSheet = ref(false)
const avatarBusy = ref(false)

// 更新头像
const updateAvatar = () => {
  if (avatarBusy.value) return
  showAvatarSheet.value = true
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

const handleChooseAvatar = async (event: unknown) => {
  const filePath = (event as { detail?: { avatarUrl?: string } })?.detail?.avatarUrl
  if (avatarBusy.value || !filePath) return
  avatarBusy.value = true
  showAvatarSheet.value = false
  try {
    // chooseAvatar 不返回大小，从临时文件读取后统一校验。
    const { size } = await uni.getFileInfo({ filePath })
    await uploadAvatarFile(filePath, size)
  } catch (error) {
    showAvatarError(error)
  } finally {
    avatarBusy.value = false
  }
}

const chooseAvatarImage = async (source: 'album' | 'camera') => {
  if (avatarBusy.value) return
  avatarBusy.value = true
  showAvatarSheet.value = false
  try {
    const result = await new Promise<AvatarMediaResult>((resolve, reject) => {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: [source],
        success: resolve,
        fail: reject
      })
    })
    const file = result.tempFiles[0]
    if (file) await uploadAvatarFile(file.tempFilePath, file.size)
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
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
  padding: 0 24rpx;
  padding-bottom: env(safe-area-inset-bottom);
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
    .avatar-area {
      width: 70rpx;
      height: 70rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      overflow: hidden;
      background-color: $subBg;

      .avatar-icon {
        width: 64rpx;
        height: 70rpx;
      }
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

  // 更换头像的操作面板
  .avatar-actions {
    padding: 0 24rpx;

    .avatar-action {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      min-height: 112rpx;
      margin: 0;
      padding: 24rpx;
      box-sizing: border-box;
      border: 0;
      border-radius: 0;
      background-color: #fff;
      color: $textDefault;
      font-size: 32rpx;
      font-weight: normal;
      line-height: 1.5;

      &::after {
        border: 0;
      }

      & + .avatar-action {
        border-top: 2rpx solid $line;
      }

      &--wechat {
        color: $sub;
      }

      &--pressed {
        background-color: $subBg;
      }
    }
  }
}
</style>
