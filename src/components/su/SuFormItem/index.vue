<template>
  <view class="su-form-item">
    <view class="header">
      <view class="header-left">
        <view class="title-border"></view>
        <view class="title-text">{{ props.title }}</view>
        <view v-if="props.required" class="require-icon">*</view>
      </view>
    </view>
    <view class="main">
      <slot></slot>
    </view>
  </view>
</template>

<script lang="ts">
export default {
  name: 'SuFormItem' // 表单项组件
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
  required?: boolean // 是否必填
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  type: '',
  required: false
})
</script>

<style lang="scss" scoped>
.su-form-item {
  background-color: #fff;
  // border: 2rpx solid #e8e5da;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 12rpx;

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12rpx;

    .header-left {
      display: flex;

      .title-border {
        background-color: $theme;
        width: 8rpx;
        height: 36rpx;
        margin-right: 12rpx;
        border-radius: 8rpx;
        margin-top: 6rpx;
      }

      .title-text {
        color: $textDark;
        font-size: 32rpx;
        font-weight: bold;
        line-height: 48rpx;
      }

      .require-icon {
        color: $danger;
        font-size: 32rpx;
        font-weight: bold;
        margin-left: 12rpx;
      }
    }
  }

  .main {
    // margin-top: 20rpx;
  }
}
</style>
