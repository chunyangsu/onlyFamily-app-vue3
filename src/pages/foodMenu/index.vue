<template>
  <view class="content">
    222
    <!-- 搜索栏 -->
    <view class="search">
      <view class="search-input">
        <input type="text" placeholder="请输入搜索内容" />
      </view>
      <view class="search-btn">
        <button>搜索</button>
      </view>
    </view>
    <!-- 顶部tab导航 -->
    <view class="top-tab">
      <!-- <wd-tabs v-model="navTab" @change="changeNavTab">
        <wd-tab :title="`我要点餐`" name="order" />
        <wd-tab :title="`添加菜品`" name="add" />
      </wd-tabs> -->
      <view>
        <wd-button @click="goToAddDish">添加菜品</wd-button>
      </view>
    </view>
    <view class="main">
      <!-- 左侧导航 -->
      <view class="left-nav"> </view>
      <!-- 右侧列表 -->
      <view class="right-list"> </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 跳转"添加菜品"页面
const goToAddDish = () => {
  uni.navigateTo({
    url: '/views/food/addDish/index'
  })
}
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
