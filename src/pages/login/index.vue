<template>
  <view class="su-container login">
    <view class="bg-img">
      <SuImage name="login-bg.webp" />
    </view>
    <view class="content">
      <view class="logo-area">
        <view class="logo">
          <SuImage name="logo.webp" />
        </view>
      </view>
      <view class="title">家在一起，生活更美好</view>
      <view class="btn-area" @click="handleLogin">
        <!-- <view class="btn-icon">
          <SuImage name="login-phone.png"></SuImage>
        </view> -->
        <!-- <view class="btn-text">手机号一键登录</view> -->
        <view class="btn-text">{{ loggingIn ? '登录中...' : '微信一键登录' }}</view>
      </view>
      <view class="agree">
        <view class="check-box">
          <wd-checkbox v-model="checked" checked-color="#feae39" />
        </view>
        <view class="text">我已阅读并同意</view>
        <view class="agreement">《用户服务协议》</view>
        <view class="policy">《隐私政策》</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
import { redirectAfterLogin } from '@/utils/loginRedirect'
// api
// ts

const userStore = useUserStore()

const checked = ref(false)
const loggingIn = ref(false)
let pageVisible = false

// 登录
const handleLogin = async () => {
  if (loggingIn.value) return
  try {
    if (!checked.value) {
      uni.showToast({
        title: '请先阅读并同意相关协议',
        icon: 'none'
      })
      return
    }
    loggingIn.value = true
    await userStore.login()
    // 不延时跳首页；用户已打开其他分享页时，不覆盖当前入口
    if (pageVisible && (await redirectAfterLogin())) {
      uni.showToast({ title: '登录成功', icon: 'success' })
    }
  } catch (err) {
    // 请求层已提示业务和网络错误；补齐微信登录异常及其他 HTTP 错误
    const detail = err as { statusCode?: number; msg?: string }
    if ((detail?.statusCode && detail.statusCode !== 401) || err instanceof Error) {
      uni.showToast({ title: detail?.msg || (err instanceof Error ? err.message : '登录失败，请重试'), icon: 'none' })
    }
  } finally {
    loggingIn.value = false
  }
}

// 登录页是启动时的默认页面。页面真正显示后再检查一次登录态
onShow(async () => {
  pageVisible = true
  // 微信登录可能触发前后台切换，登录进行中不重复初始化或跳转。
  if (loggingIn.value) return
  await userStore.initUserStore()
  if (pageVisible && !loggingIn.value) await redirectAfterLogin()
})

onHide(() => {
  pageVisible = false
})
onUnload(() => {
  pageVisible = false
})
</script>

<style lang="scss" scoped>
.login {
  position: relative;
  min-height: 100vh;
}

.bg-img {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20%;

  .logo-area {
    width: 200rpx;
    height: 200rpx;
    border: 6rpx solid $themeBg;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .logo {
      width: 140rpx;
      height: 140rpx;
    }
  }

  .title {
    margin-top: 24rpx;
    font-size: 32rpx;
  }

  .btn-area {
    margin-top: 300rpx;
    display: flex;
    justify-content: center;
    background-color: #feae39;
    width: 90%;
    padding: 24rpx 0;
    border-radius: 50rpx;

    .btn-icon {
      width: 40rpx;
      height: 56rpx;
    }

    .btn-text {
      color: #fff;
      font-size: 38rpx;
      margin-left: 12rpx;
    }
  }

  .agree {
    display: flex;
    margin-top: 40rpx;

    .check-box {
      margin-right: 8rpx;
    }

    .text {
      color: $textLight;
    }

    .agreement {
      color: $theme;
    }

    .policy {
      color: $theme;
    }
  }
}
</style>
