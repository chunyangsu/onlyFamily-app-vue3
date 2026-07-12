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
      <!-- <wd-tabs v-model="tab">
        <block v-for="item in 4" :key="item">
          <wd-tab :title="`标签${item}`">
            <view class="content">内容{{ item }}</view>
          </wd-tab>
        </block>
      </wd-tabs> -->
      <wd-tabs v-model="tab">
        <block v-for="item in 4" :key="item">
          <wd-tab :title="`标签${item}`">
            <view class="content">内容{{ item }}</view>
          </wd-tab>
        </block>
      </wd-tabs>
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
// 当前选中的 Tab 名称，默认选中 'order'（我要点餐）
const tab = ref<number>(0)
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
