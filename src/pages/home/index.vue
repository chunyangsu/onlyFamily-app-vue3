<template>
  <view class="common-container home">
    <!-- 家庭信息-模块 -->
    <view class="family">
      <view class="family-content">
        <view class="family-date">2026.10.28 星期四</view>
        <view class="family-title">早上好！欢迎回家！</view>
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
          <view class="add-btn">继续点餐</view>
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
        <view class="transaction">
          <view class="transaction-main">
            <view class="main-left">
              <view class="label">本月支出</view>
              <view class="amount">￥3500.26</view>
            </view>
            <view class="main-right">
              <view class="main-right-row">
                <view class="label">收入</view>
                <view class="amount">￥12000.00</view>
              </view>
              <view class="main-right-row balance">
                <view class="label">结余</view>
                <view class="amount">￥3000.00</view>
              </view>
            </view>
          </view>
          <view class="add-btn">+记一笔</view>
        </view>
      </SuCard>
    </view>
    <!-- 生活动态-模块 -->
    <view class="card-item m-b-24rpx">
      <SuCard title="生活动态">
        <view class="life">
          <view class="header">
            <view class="user-avatar">头像</view>
            <view class="header-info">
              <view class="user-name">妈妈</view>
              <view class="time">今天 08:30</view>
            </view>
          </view>
          <view class="content"> 周末做了丰富的早餐，开启元气满满的一天！ </view>
        </view>
      </SuCard>
    </view>
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
        color: $textLight;
      }

      .family-title {
        color: $textDark;
        font-size: 48rpx;
        font-weight: bold;
      }

      .family-name {
        margin-top: 24rpx;
        color: $textDefault;
        font-weight: bold;
      }

      .family-member {
        margin-top: 24rpx;
        display: flex;

        .member-item {
          width: 80rpx;
          height: 80rpx;
          line-height: 76rpx;
          text-align: center;
          border-radius: 50%;
          background-color: #ccc;
          margin-right: 12rpx;
        }
      }
    }

    .family-logo {
      width: 250rpx;
      height: 250rpx;
      line-height: 246rpx;
      text-align: center;
      margin-top: 24rpx;
      border-radius: 50%;
      background-color: #ccc;
    }
  }

  // 今日菜单
  .food-menu {
    .food-menu-main {
      display: flex;

      .left-img {
        width: 300rpx;
        height: 300rpx;
        line-height: 298rpx;
        text-align: center;
        border-radius: 12rpx;
        background-color: #ccc;
      }

      .left-content {
        flex: 1;
        margin-left: 24rpx;

        .dish-item {
          color: $textLight;
          line-height: 52rpx;
        }
      }
    }

    .add-btn {
      width: 100%;
      padding: 16rpx 0;
      border-radius: 12rpx;
      background-color: $primary;
      text-align: center;
      color: #fff;
      margin-top: 24rpx;
    }
  }

  // 本月账单
  .transaction {
    .transaction-main {
      display: flex;

      .main-left {
        flex: 1;

        .label {
          color: $textLight;
        }

        .amount {
          color: $textDark;
          font-size: 52rpx;
          font-weight: bold;
        }
      }

      .main-right {
        flex: 1;
        border-left: 1px solid $textLine;
        padding-left: 24rpx;

        .main-right-row {
          display: flex;
          justify-content: space-between;

          .label {
            color: $textLight;
          }

          .amount {
            color: $textDark;
            font-size: 32rpx;
            font-weight: bold;
          }
        }

        // 结余
        .balance {
          margin-top: 24rpx;
        }
      }
    }

    .add-btn {
      width: 100%;
      padding: 16rpx 0;
      border-radius: 12rpx;
      background-color: $primaryBg;
      text-align: center;
      color: $primary;
      margin-top: 24rpx;
    }
  }

  // 生活动态
  .life {
    .header {
      display: flex;

      .user-avatar {
        width: 80rpx;
        height: 80rpx;
        line-height: 76rpx;
        text-align: center;
        border-radius: 50%;
        background-color: #ccc;
      }

      .header-info {
        margin-left: 24rpx;

        .user-name {
          color: $textDark;
        }

        .time {
          color: $textLight;
          font-size: 28rpx;
        }
      }
    }

    .content {
      margin-top: 24rpx;
      color: $textDefault;
    }
  }
}
</style>
