<template>
  <view class="su-container home">
    <!-- 家庭信息-模块 -->
    <view class="family">
      <view class="family-content">
        <view class="family-date">{{ getCurrentDate() + ' · ' + getCurrentWeekday() }}</view>
        <view class="family-title">您好，欢迎回家！</view>
        <view class="family-name">
          <view>{{ userStore.familyInfo.name }}</view>
          <view class="m-l-8rpx"><wd-icon name="caret-down" size="26px" color="#feae39" /></view>
        </view>
        <!-- 家庭成员 -->
        <view class="family-member">
          <view v-for="item in familyMemberList" :key="item.id" class="member-item">
            <view v-if="item.avatarId > 0" class="w-100% h-100%">
              <SuImage :src="item.avatarUrl" />
            </view>
            <view v-else class="avatar-icon">
              <SuImage name="avatar.webp" />
            </view>
          </view>
          <view class="member-item">
            <view class="avatar-icon">
              <SuImage name="avatar.webp" />
            </view>
          </view>
        </view>
      </view>
      <view class="family-logo">
        <SuImage v-if="userStore.familyInfo.avatarId > 0" :src="userStore.familyInfo.avatarUrl" />
        <SuImage v-else name="family-home.webp" />
      </view>
    </view>
    <!-- 今日菜单-模块 -->
    <view class="card-item">
      <SuCard title="今日菜单推荐" icon="cutlery">
        <view class="food-menu">
          <view class="food-menu-main">
            <view class="left-img">
              <view v-for="item in dishList" :key="item.id" class="food-img-item">
                <SuImage :src="item.mainImageUrl" />
              </view>
            </view>
            <view class="right-content">
              <view v-for="item in dishList" :key="item.id" class="dish-item">
                {{ item.name }}
              </view>
            </view>
          </view>
          <view class="add-btn" @click="goToFoodMenu">前往点餐</view>
        </view>
      </SuCard>
    </view>
    <!-- 本月账单-模块 -->
    <!-- <view class="card-item">
      <SuCard title="本月账单" icon="wallet" show-more>
        <view class="transaction">
          <view class="transaction-main">
            <view class="main-left">
              <view class="label">本月支出</view>
              <view class="amount">￥{{ moneyFormat(3560.26) }}</view>
            </view>
            <view class="main-right">
              <view class="main-right-row">
                <view class="label">收入</view>
                <view class="amount">￥{{ moneyFormat(12000) }}</view>
              </view>
              <view class="main-right-row balance">
                <view class="label">结余</view>
                <view class="amount">￥{{ moneyFormat(8439.74) }}</view>
              </view>
            </view>
          </view>
          <view class="add-btn" @click="goToTransaction">+记一笔</view>
        </view>
      </SuCard>
    </view> -->
    <!-- 生活动态-模块 -->
    <!-- <view class="card-item">
      <SuCard title="生活动态" icon="image" show-more>
        <view class="life">
          <view class="header">
            <view class="user-avatar">
              <SuImage name="xfcf.jpg"></SuImage>
            </view>
            <view class="header-info">
              <view class="user-name">妈妈</view>
              <view class="time">今天 08:30</view>
            </view>
          </view>
          <view class="content"> 周末做了丰富的早餐，开启元气满满的一天！ </view>
        </view>
      </SuCard>
    </view> -->
  </view>
</template>

<script setup lang="ts">
// 全局属性
import { useUserStore } from '@/stores/useUserStore'
// api
import { getFamilyMemberListApi } from '@/api/modules/family'
import { getDishListApi } from '@/api/modules/food/dish'
// ts
import type { FamilyMemberItem } from '@/api/modules/family/types'
// utils
import { moneyFormat } from '@/utils/money'
import { getCurrentDate, getCurrentWeekday } from '@/utils/time'

const userStore = useUserStore()

// 跳转"厨房"页面
const goToFoodMenu = () => {
  uni.switchTab({
    url: '/pages/foodMenu/index'
  })
}

// 跳转"账单"页面
const goToTransaction = () => {
  uni.switchTab({
    url: '/pages/transaction/index'
  })
}

const familyMemberList = ref<FamilyMemberItem[]>([])
// 获取家庭成员列表
const getFamilyMemberList = async () => {
  const response = await getFamilyMemberListApi(userStore.familyInfo.id)
  familyMemberList.value = []
  response.forEach((item) => {
    familyMemberList.value.push({
      id: item.id,
      nickname: item.nickname,
      avatarId: item.avatarId,
      avatarUrl: item.avatarUrl
    })
  })
}

// 菜品列表字段
export interface DishItem {
  id: number
  name: string // 名称
  mainImageId: number // 菜品主图id
  mainImageUrl: string // 菜品主图url地址
}
const dishList = ref<DishItem[]>([])

// 获取菜品列表
const getDishList = async () => {
  const query = {
    name: ''
  }
  const response = await getDishListApi(query)
  dishList.value = []
  if (response.list.length > 0) {
    response.list.forEach((item) => {
      dishList.value.push({
        id: item.id,
        name: item.name,
        mainImageId: item.mainImageId,
        mainImageUrl: item.mainImageUrl
      })
    })
  }
}

onLoad(() => {
  getDishList()
  getFamilyMemberList()
})
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
        display: flex;
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
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background-color: $subBg;
          margin-right: 12rpx;
          overflow: hidden;
          .avatar-icon {
            width: 50rpx;
            height: 56rpx;
          }
        }
      }
    }

    .family-logo {
      width: 250rpx;
      height: 250rpx;
      line-height: 246rpx;
      text-align: center;
      margin-top: 24rpx;
      border-radius: 24rpx;
      overflow: hidden;
    }
  }

  // 今日菜单
  .food-menu {
    .food-menu-main {
      display: flex;

      .left-img {
        display: flex;
        flex-wrap: wrap;
        gap: 8rpx;
        width: 300rpx;
        height: 300rpx;
        .food-img-item {
          flex: 0 0 calc(50% - 4rpx);
          text-align: center;
          border-radius: 12rpx;
          overflow: hidden;
        }
      }

      .right-content {
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
      background-color: $theme;
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
        border-left: 2rpx solid $line;
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
      background-color: $themeBg;
      text-align: center;
      color: $theme;
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
        background-color: #fff;
        overflow: hidden;
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
