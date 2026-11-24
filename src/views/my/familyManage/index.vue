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
                  <view v-if="userStore.familyInfo.avatarId > 0" class="w-100% h-100%">
                    <SuImage :src="userStore.familyInfo.avatarUrl" />
                  </view>
                  <view v-else class="avatar-icon">
                    <SuImage name="family-home.webp" />
                  </view>
                </view>
              </view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
          <!-- 名称 -->
          <view class="row-item" @click="updateName">
            <view class="item-left">名称</view>
            <view class="item-right">
              <view class="right-value">{{ userStore.familyInfo.name }}</view>
              <view class="right-arrow">
                <wd-icon name="right" size="28rpx" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 底部 -->
    <!-- <view class="footer">
      <view class="logout" @click="handleLogout">
        <view class="logout-icon">
          <SuImage name="logout.webp" />
        </view>
        <view class="logout-text">退出家庭</view>
      </view>
    </view> -->
    <!-- 更换头像操作面板：从相册选择、拍照 -->
    <wd-action-sheet v-model="showAvatarSheet" title="更换头像" cancel-text="取消" :safe-area-inset-bottom="true">
      <view class="avatar-actions">
        <button class="avatar-action" hover-class="avatar-action--pressed" :disabled="avatarBusy" @click="chooseAvatarImage('album')">从相册选择</button>
        <button class="avatar-action" hover-class="avatar-action--pressed" :disabled="avatarBusy" @click="chooseAvatarImage('camera')">拍照</button>
      </view>
    </wd-action-sheet>
    <!-- 修改名称弹窗 -->
    <!-- <wd-dialog selector="nickname">
      <view class="nickname-content">
        <SuInput v-model="nicknameDraft" placeholder="请输入昵称" />
      </view>
      <template #actions="{ confirm, cancel }">
        <view class="nickname-actions">
          <wd-button plain :disabled="nicknameBusy" @click="cancel">取消</wd-button>
          <wd-button :loading="nicknameBusy" :disabled="nicknameBusy" @click="confirm">确定</wd-button>
        </view>
      </template>
    </wd-dialog> -->
  </view>
</template>

<script setup lang="ts">
// import { useDialog } from '@wot-ui/ui'
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
// api
import { updateFamilyAvatarApi } from '@/api/modules/family'
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
// const nicknameDialog = useDialog('nickname')
// const nicknameDraft = ref('')
// const nicknameBusy = ref(false)

// const saveNickname = async () => {
//   if (nicknameBusy.value) return false
//   const nickname = nicknameDraft.value.trim()
//   if (!nickname) {
//     uni.showToast({ title: '请输入昵称', icon: 'none' })
//     return false
//   }
//   const { id: userId, familyId } = userStore.userInfo
//   const token = userStore.token
//   nicknameBusy.value = true
//   try {
//     const result = await updateUserNicknameApi({ nickname })
//     if (userStore.userInfo.id !== userId || userStore.userInfo.familyId !== familyId || userStore.token !== token) return true
//     userStore.updateUserNickname(result)
//     uni.showToast({ title: '昵称已更新', icon: 'success' })
//     return true
//   } catch (error) {
//     uni.showToast({ title: getUploadErrorMessage(error, '修改昵称失败，请重试'), icon: 'none' })
//     return false
//   } finally {
//     nicknameBusy.value = false
//   }
// }

const updateName = () => {
  //   if (nicknameBusy.value) return
  //   nicknameDraft.value = userStore.userInfo.nickname || ''
  //   nicknameDialog.confirm({ title: '修改昵称', beforeConfirm: saveNickname }).catch(() => {})
}

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
    const attachment = await uploadAttachment({ filePath, module: 'family', moduleType: 'avatar' })
    if (!sameSession()) return
    uni.showLoading({ title: '保存中...', mask: true })
    const avatar = await updateFamilyAvatarApi({ avatarId: attachment.id })
    if (!sameSession()) return
    userStore.updateFamilyAvatar(avatar)
  } finally {
    uni.hideLoading()
  }
  uni.showToast({ title: '家庭头像已更新', icon: 'success' })
}

const showAvatarError = (error: unknown) => {
  const message = getUploadErrorMessage(error, '选择或更新头像失败，请重试')
  if (!/cancel/i.test(message)) uni.showToast({ title: message, icon: 'none' })
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

  // .nickname-content {
  //   padding: 8rpx 40rpx 24rpx;
  //   text-align: left;
  // }

  // .nickname-actions {
  //   display: flex;
  //   justify-content: space-evenly;
  //   padding: 0 24rpx 32rpx;
  // }
}
</style>
