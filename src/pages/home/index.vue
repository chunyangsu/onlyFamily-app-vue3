<template>
  <view class="common-container home">
    <!-- 家庭信息-模块 -->
    <view class="family">
      <view class="family-content">
        <view class="family-date">2026.10.28 星期四</view>
        <view class="family-title">早上好！欢迎回家</view>
        <view class="family-name">我们的小家</view>
        <!-- 家庭成员 -->
        <view class="family-member">
          <view class="member-item">爸爸</view>
          <view class="member-item">妈妈</view>
          <view class="member-item">儿子</view>
        </view>
      </view>
      <view class="family-logo">图片</view>
    </view>
    <!-- 今日菜单-模块 -->
    <view class="card-item">
      <SuCard title="今日菜单">
        <view class="food-menu">
          <view class="food-menu-main">
            <view class="left-img">图片</view>
            <view class="left-content">
              <view class="dish-item">土豆炖牛腩</view>
              <view class="dish-item">青椒土豆丝</view>
              <view class="dish-item">番茄鸡蛋汤</view>
              <view class="dish-item">米饭</view>
            </view>
          </view>
          <view class="add-food-btn">继续点餐</view>
          <!-- <view class="food-footer">
          <view>午餐/晚餐</view>
          <view>3人用餐</view>
        </view> -->
        </view>
      </SuCard>
    </view>
    <!-- 本月账单-模块 -->
    <view class="card-item">
      <SuCard title="本月账单">
        <view class="transaction">本月账单</view>
      </SuCard>
    </view>
    <!-- 生活动态-模块 -->
    <!-- <view class="card-item">
      <SuCard title="生活动态">
        <view class="life">生活动态</view>
      </SuCard>
    </view> -->
  </view>
</template>

<script setup lang="ts">
// 全局属性
// api
// import { getUserListApi } from '@/api/modules/user'
// ts
// utils
</script>

<style lang="scss" scoped>
.home {
  padding: 0 24rpx;

  .card-item {
    margin-top: 24rpx;
  }

  // 家庭信息
  .family {
    display: flex;

    .family-content {
      flex: 1;

      .family-date {
        color: #666;
      }

      .family-title {
        font-size: 50rpx;
      }

      .family-name {}

      .family-member {
        display: flex;

        .member-item {
          width: 80rpx;
          height: 80rpx;
          border-radius: 50%;
          background-color: #ccc;
        }
      }
    }

    .family-logo {
      width: 200rpx;
      height: 200rpx;
      line-height: 198rpx;
      text-align: center;
      border-radius: 50%;
      background-color: #ccc;
    }
  }

  // 今日菜单
  .food-menu {
    .food-menu-main {
      display: flex;

      .left-img {
        width: 200rpx;
        height: 200rpx;
        line-height: 198rpx;
        text-align: center;
        border-radius: 12rpx;
        background-color: #ccc;
      }

      .left-content {
        flex: 1;
      }
    }

    .add-food-btn {
      width: 100%;
      padding: 16rpx 0;
      border-radius: 12rpx;
      background-color: $primary;
      text-align: center;
      color: #fff;
      margin-top: 24rpx;
    }
  }
}
</style>
