<template>
  <view class="su-container food-order">
    <view class="tab-menu">
      <view class="tab-item active">全部订单</view>
      <view class="tab-item">我的订单</view>
    </view>
    <view class="order-list">
      <view v-for="item in orderList" class="order-item">
        <view class="order-header">
          <view class="user-info">
            <view class="user-avatar">头像</view>
            <view class="user-name">{{ item.creator }}</view>
          </view>
          <view class="order-time">{{ item.createTime }}</view>
        </view>
        <!-- 菜品列表 -->
        <view class="dish-list">
          <view v-for="(val, index) in item.dishArr" :key="index" class="dish-item">
            <view class="dish-img">
              <SuImage :src="val.mainImageUrl"></SuImage>
            </view>
            <view class="dish-content">
              <view class="dish-name">{{ val.name }}</view>
              <view class="price-num">
                <view class="dish-price">￥ {{ val.price }}</view>
                <view class="dish-num">×{{ val.num }}</view>
              </view>
            </view>
          </view>
        </view>
        <!-- 备注 -->
        <view class="order-remark">
          <view v-if="item.remark !== ''">备注：{{ item.remark }}</view>
          <view v-else class="no-remark">暂无备注</view>
        </view>
        <!-- 订单进度 -->
        <view class="order-progress">订单进度</view>
        <!-- 操作栏 -->
        <view class="btn-bar">
          <view class="cancel btn-item">取消订单</view>
          <view class="delete btn-item">删除订单</view>
          <view class="complete btn-item">完成订单</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 全局属性
// api
import { getFoodOrderListApi } from '@/api/modules/food/foodOrder'
// ts
// import type { FoodOrderFormApi } from '@/api/modules/food/foodOrder/types'
// utils
import { parseTime } from '@/utils/time'

interface OrderItem {
  id: number // 订单id
  code: string // 订单编号
  progress: string // 订单进度
  remark: string // 订单备注
  dishArr: DishItem[]
  createId: number // 创建人id
  creator: string // 创建人
  createTime: string // 创建时间
}

interface DishItem {
  id: number // 菜品id
  name: string // 菜品名称
  mainImageUrl: string // 菜品主图
  price: string // 价格
  num: number // 数量
}

// 订单列表
const orderList = ref<OrderItem[]>([])

// 获取食物订单列表
const getFoodOrderList = async () => {
  getFoodOrderListApi().then((response: any) => {
    orderList.value = []
    response.forEach((item: any) => {
      orderList.value.push({
        id: item.id,
        code: item.code,
        progress: item.progress,
        remark: item.remark,
        dishArr: [],
        createId: item.createId,
        creator: item.creator,
        createTime: parseTime(item.createTime, '{y}-{m}-{d} {h}:{i}:{s}')
      })
      if (item.dishArr && item.dishArr.length > 0) {
        item.dishArr.forEach((val: any) => {
          orderList.value[orderList.value.length - 1].dishArr.push({
            id: val.id,
            name: val.name,
            mainImageUrl: val.mainImageUrl,
            price: val.price,
            num: val.num
          })
        })
      }
    })
    // console.log(orderList.value)
  })
}

// 页面加载时触发
onLoad(() => {
  getFoodOrderList()
})
</script>

<style lang="scss" scoped>
.food-order {
  padding: 0 24rpx;
  padding-bottom: 40rpx;

  .tab-menu {
    position: sticky;
    top: 0; // 设置吸顶阈值，固定在页面内容区顶部
    z-index: 10;
    background-color: $pageBg; // 防止下面的订单内容透出来
    display: flex;
    gap: 8rpx;
    padding-bottom: 36rpx;

    .tab-item {
      flex: 1;
      font-size: 32rpx;
      color: $textDefault;
      border-radius: 28rpx;
      background-color: #f6f2ec;
      padding: 16rpx 0;
      text-align: center;
    }

    .tab-item.active {
      color: #fff;
      background-color: $theme;
    }
  }

  .order-list {
    .order-item {
      margin-bottom: 36rpx;
      background-color: #fff;
      border-radius: 24rpx;
      padding: 24rpx;

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2rpx solid $line;
        padding-bottom: 8rpx;

        .user-info {
          display: flex;
          align-items: center;

          .user-avatar {
            width: 80rpx;
            line-height: 80rpx;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            overflow: hidden;
            background-color: #f6f2ec;
          }

          .user-name {
            margin-left: 32rpx;
          }
        }

        .order-time {
          color: $textLight;
        }
      }

      .dish-list {
        .dish-item {
          display: flex;
          margin-top: 16rpx;

          .dish-img {
            width: 160rpx;
            height: 160rpx;
            text-align: center;
            line-height: 156rpx;
            background-color: #666;
            color: #fff;
            border-radius: 16rpx;
            overflow: hidden;
          }

          .dish-content {
            flex: 1;
            padding: 0 20rpx;

            .dish-name {
              color: $textDefault;
              height: 100rpx;
              font-size: 30rpx;
              font-weight: bold;
            }

            .price-num {
              display: flex;
              justify-content: space-between;

              .dish-price {
                color: $theme;
                font-size: 32rpx;
                font-weight: bold;
              }

              .dish-num {
                color: $textLight;
                font-size: 30rpx;
              }
            }
          }
        }

        .dish-item:last-child {
          margin-bottom: 0;
        }
      }

      .order-remark {
        margin-top: 16rpx;

        .no-remark {
          color: $textLight;
        }
      }

      .order-progress {
        margin-top: 16rpx;
      }

      .btn-bar {
        display: flex;
        justify-content: end;
        margin-top: 8rpx;

        .btn-item {
          padding: 8rpx 18rpx;
          border-radius: 38rpx;
        }

        .cancel {
          border: 2rpx solid $line;
        }

        .delete {
          margin-left: 8rpx;
          border: 2rpx solid $line;
        }

        .complete {
          margin-left: 8rpx;
          color: #fff;
          background-color: $theme;
        }
      }
    }
  }
}
</style>
