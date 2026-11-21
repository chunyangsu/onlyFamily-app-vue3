<template>
  <view class="su-container order-placed">
    <view class="bg-img">
      <!-- <SuImage name="order-placed-bg.png"></SuImage> -->
    </view>
    <view class="main">
      <view class="title">下单成功</view>
      <view class="tip">我们会尽快为您准备美味佳肴</view>
      <view class="btn-bar">
        <view class="back btn-item" @click="goBack">返回</view>
        <view class="view btn-item" @click="viewOrder">查看订单</view>
        <button class="remind" open-type="share">
          <wd-icon name="share" />
          提醒厨师
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// api
// ts

const formData = ref({
  orderId: 0 // 订单id
})
// 返回
const goBack = () => {
  // 返回到点餐主页
  uni.navigateBack({
    delta: 2
  })
}

// 查看订单(todo：后续要跳转订单详情页)
const viewOrder = () => {
  uni.navigateTo({
    url: '/views/food/foodOrder/index'
  })
}

onLoad((options) => {
  if (options?.orderId && Number(options?.orderId) > 0) {
    formData.value.orderId = options.orderId
  }
})

// 配置微信分享
onShareAppMessage(() => {
  return {
    title: '有人下单啦，快来看看！',
    path: `/views/food/orderDetail/index?id=${encodeURIComponent(formData.value.orderId)}`,
    imageUrl: 'https://你的图片地址/order-share.png'
  }
})
</script>

<style lang="scss" scoped>
.order-placed {
  position: relative;
  min-height: 100vh;

  .bg-img {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
  }

  .main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 80rpx;
    padding-top: 70%;

    .title {
      font-size: 60rpx;
      color: $textDark;
    }

    .tip {
      color: $textLight;
      margin-top: 12rpx;
      font-size: 32rpx;
    }

    .btn-bar {
      margin-top: 100rpx;
      width: 100%;

      .btn-item {
        border-radius: 50rpx;
        height: 100rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 36rpx;
      }

      .back {
        color: $sub;
        border: 2rpx solid $sub;
      }

      .view {
        margin-top: 36rpx;
        color: #fff;
        background-color: $theme;
      }

      .remind {
        margin-top: 36rpx;
        color: $sub;
        border: 2rpx solid $sub;
        border-radius: 50rpx;
        background-color: $pageBg;
      }
    }
  }
}
</style>
<style lang="scss">
:deep(.remind::after) {
  border: none;
}
</style>
