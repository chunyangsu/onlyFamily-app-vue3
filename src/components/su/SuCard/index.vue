<template>
  <view class="su-card">
    <view class="header">
      <view class="header-left">
        <view v-if="props.icon !== ''" class="card-icon">
          <SuImage :name="props.icon + '.png'"></SuImage>
        </view>
        <view class="card-title">{{ title }}</view>
      </view>
      <view class="header-right">
        <view class="view-more">查看更多</view>
        <view class="view-icon">
          <wd-icon name="right" size="28rpx"></wd-icon>
        </view>
      </view>
    </view>
    <view class="main">
      <slot></slot>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  name: 'SuCard' // 卡片组件
}
</script>
<script setup lang="ts">
// 全局属性
// api
// ts
// utils

// props属性
interface Props {
  title?: string // 标题
  type?: string // 类型
  icon?: string // 图标
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  type: '',
  icon: ''
})
</script>

<style lang="scss" scoped>
.su-card {
  background-color: #fff;
  border: 2rpx solid #e8e5da;
  border-radius: 24rpx;
  padding: 24rpx;

  .header {
    display: flex;
    justify-content: space-between;

    .header-left {
      display: flex;

      .card-icon {
        margin-right: 16rpx;
        width: 48rpx;
        height: 48rpx;
        line-height: 44rpx;
        text-align: center;
        overflow: hidden;
      }

      .card-title {
        color: $textDark;
        font-size: 36rpx;
        font-weight: bold;
        line-height: 48rpx;
      }
    }

    .header-right {
      display: flex;
      color: #8d8d8d;
      align-items: center;

      .view-more {}

      .view-icon {
        display: flex;
        margin-left: 8rpx;
        padding-top: 6rpx;
      }
    }
  }

  .main {
    margin-top: 20rpx;
  }
}
</style>
