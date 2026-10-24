<template>
  <view class="container">
    <!-- 导航按钮 -->
    <view class="nav-btn-bar">
      <view class="nav-item">账户</view>
      <view class="nav-item">记账</view>
      <view class="nav-item">报表</view>
    </view>
    <!-- 月度账单 -->
    <!-- 明细列表 -->
  </view>
</template>

<script setup lang="ts">
// api
// import { getDishCategoryListApi } from '@/api/modules/food/category'
// ts
// import type { DishCategoryItem } from '@/api/modules/food/category/types'

// 页面加载时获取分类列表
onLoad(() => {
  // getDishCategoryList()
  // getDishList()
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
</style>
