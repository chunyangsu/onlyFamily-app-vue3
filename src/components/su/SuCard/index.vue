<template>
  <view :class="[props.showBorder ? 'show-border' : '', 'su-card']">
    <view v-if="!props.hideHeader" class="header">
      <view class="header-left">
        <view v-if="props.icon !== ''" class="card-icon">
          <SuImage :name="props.icon + '.png'"></SuImage>
        </view>
        <view v-else class="card-border"></view>
        <view class="card-title">{{ title }}</view>
      </view>
      <view v-if="props.showMore" class="header-right">
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
  hideHeader?: boolean // 是否展示头部
  showBorder?: boolean // 是否展示边框线
  showMore?: boolean // 是否展示更多按钮
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  type: '',
  icon: '',
  hideHeader: false,
  showBorder: false,
  showMore: false
})
</script>

<style lang="scss" scoped>
.su-card {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 24rpx;

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;

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

      .card-border {
        background-color: $theme;
        width: 8rpx;
        height: 100%;
        margin-right: 16rpx;
        border-radius: 8rpx;
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
      color: $textLight;
      align-items: center;

      .view-more {}

      .view-icon {
        display: flex;
        margin-left: 8rpx;
        padding-top: 6rpx;
      }
    }
  }

  .main {}
}

.show-border {
  border: 2rpx solid #e8e5da;
}
</style>
