<template>
  <view class="container">
    <view class="order-list">
      <view v-for="item in orderList" class="order-item">
        <view class="user-info">
          <view class="user-img">头像</view>
          <view class="user-name">{{ item.creator }}</view>
        </view>
        <!-- 菜品列表 -->
        <view class="dish-list">
          <view v-for="(val, index) in item.dishArr" :key="index" class="dish-item">
            <view class="dish-img">11</view>
            <view class="dish-content">
              <view class="dish-name">{{ val.name }}</view>
              <view class="price-num">
                <view class="dish-price">￥ {{ val.price }}</view>
                <view class="dish-num">×{{ val.num }}</view>
              </view>
            </view>
          </view>
        </view>
        <!-- 订单信息 -->
        <view class="order-info">
          <view class="order-time">下单时间：{{ item.createTime }}</view>
          <view class="order-progress">订单进度</view>
        </view>
        <!-- 操作栏 -->
        <view class="btn-bar">
          <view class="cancel">取消</view>
          <view class="delete">删除</view>
          <view class="complete">完成</view>
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
  dishArr: DishItem[]
  createId: number // 创建人id
  creator: string // 创建人
  createTime: string // 创建时间
}

interface DishItem {
  id: number // 菜品id
  name: string // 菜品名称
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
            price: val.price,
            num: val.num
          })
        })
      }
    })
    console.log(orderList.value)
  })
}

// 页面加载时触发
onLoad(() => {
  getFoodOrderList()
})
</script>

<style lang="scss" scoped>
.container {
  .order-list {
    .order-item {
      margin-top: 8rpx;
      border-radius: 4rpx;
      padding: 4rpx;

      .user-info {
        display: flex;
      }

      .dish-list {
        .dish-item {
          display: flex;
          margin-bottom: 8px;

          .dish-img {
            width: 80px;
            height: 80px;
            text-align: center;
            line-height: 78px;
            background-color: #666;
            color: #fff;
            border-radius: 4px;
          }

          .dish-content {
            flex: 1;
            padding: 0 10px;

            .dish-name {
              height: 50px;
            }

            .price-num {
              display: flex;
              justify-content: space-between;

              .dish-num {
                color: #666;
              }
            }
          }
        }
      }

      .order-info {
        display: flex;
        justify-content: space-between;
        margin-top: 8rpx;
      }

      .btn-bar {
        display: flex;
        margin-top: 8rpx;

        .delete {
          margin-left: 8rpx;
        }

        .complete {
          margin-left: 8rpx;
        }
      }
    }
  }
}
</style>
