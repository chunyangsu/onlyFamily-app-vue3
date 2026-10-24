<template>
  <view class="content">
    <!-- 轮播图 -->
    <view class="swiper">
      <wd-swiper :list="swiperList" autoplay v-model:current="current" :indicator="{ type: 'dots' }"></wd-swiper>
    </view>
    <!-- 菜单栏 -->
    <view class="menu-list card-box">
      <view class="menu-item">点餐</view>
      <view class="menu-item">记账</view>
      <view class="menu-item">分享</view>
    </view>
    <!-- 人气推荐 -->
    <view class="food-recommend card-box">
      <view class="recommend-title">美食·人气推荐</view>
      <view class="recommend-list">暂无数据</view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 全局属性
// api
import { getUserListApi } from '@/api/modules/user'
// ts
// utils

const current = ref(0)

const swiperList = ref([
  'https://wot-ui.cn/assets/redpanda.jpg',
  'https://wot-ui.cn/assets/capybara.jpg',
  'https://wot-ui.cn/assets/panda.jpg',
  'https://wot-ui.cn/assets/moon.jpg',
  'https://wot-ui.cn/assets/meng.jpg'
])
</script>

<style lang="scss">
.content {
  display: flex;
  flex-direction: column;

  .menu-list {
    margin-top: 10px;
    display: flex;

    .menu-item {
      flex: 1;
      text-align: center;
    }
  }
}
</style>
