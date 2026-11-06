<template>
  <view class="su-container login">
    <view class="bg-img">
      <SuImage name="login-bg.png"></SuImage>
    </view>
    <view class="content">
      <view class="logo-area">
        <view class="logo">
          <SuImage name="logo.png"></SuImage>
        </view>
      </view>
      <view class="title">家在一起，生活更美好</view>
      <view class="btn-area" @click="submitData">
        <view class="btn-icon">
          <SuImage name="login-phone.png"></SuImage>
        </view>
        <view class="btn-text">手机号一键登录</view>
      </view>
      <view class="agree">
        <view class="check-box">
          <wd-checkbox v-model="checked" checked-color="#feae39"></wd-checkbox>
        </view>
        <view class="text">我已阅读并同意</view>
        <view class="agreement">《用户服务协议》</view>
        <view class="policy">《隐私政策》</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { zodAdapter } from '@wot-ui/ui'
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
// api
// ts

const userStore = useUserStore()

const checked = ref(false)

// 提交
const submitData = async () => {
  try {
    if (!checked.value) {
      uni.showToast({
        title: '请先阅读并同意相关协议',
        icon: 'none'
      })
      return
    }

    // loading.value = true
    await userStore.login()

    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      // 跳转首页
      uni.switchTab({ url: '/pages/home/index' })
    }, 1000)
  } catch (err) {
    // 接口请求失败
    console.error(err)
  } finally {
    // loading.value = false
  }
}

// 登录页是启动时的默认页面。页面真正显示后再检查一次登录态
onShow(async () => {
  await userStore.initUserStore()
  if (userStore.token) {
    uni.reLaunch({
      url: '/pages/home/index',
      fail: (error) => {
        console.error('[Login] 跳转首页失败:', error)
      }
    })
  }
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
