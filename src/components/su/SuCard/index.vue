<template>
  <view class="su-card">
    <view class="header">
      <view class="header-left">
        <view v-if="icon !== ''" class="card-icon">1</view>
        <view class="card-title">{{ title }}</view>
      </view>
      <view class="header-right">
        <view>查看更多</view>
        <view>》</view>
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
    }

    .header-right {
      display: flex;
    }
  }
}
</style>
