<template>
  <view class="su-container confirm-order">
    <view class="main">
      <!-- 订单列表 -->
      <view class="card-item">
        <SuCard :title="'已选菜品（' + orderList.length + '）'">
          <view class="order-list">
            <view v-for="(item, index) in orderList" :key="index" class="order-item">
              <view class="order-img">
                <SuImage :src="item.mainImageUrl"></SuImage>
              </view>
              <view class="order-content">
                <view class="order-name">{{ item.name }}</view>
                <view class="price-num">
                  <view class="order-price">￥{{ item.price }}</view>
                  <view class="order-num">×{{ item.num }}</view>
                </view>
              </view>
            </view>
          </view>
        </SuCard>
      </view>
      <!-- 订单备注 -->
      <view class="card-item">
        <SuCard title="订单备注">
          <view class="order-remark">
            <SuInput v-model="remark" type="textarea" placeholder="请输入备注" />
          </view>
        </SuCard>
      </view>
    </view>
    <!-- 底部按钮 -->
    <view class="footer">
      <view class="footer-content">
        <view class="footer-left">
          <view class="total-label">合计：</view>
          <view class="total-price">￥ {{ totalPrice }}</view>
        </view>
        <view class="footer-right" @click="confirmData">确认下单</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// api
import { createFoodOrderApi } from '@/api/modules/food/foodOrder'
// ts
import type { FoodOrderFormApi } from '@/api/modules/food/foodOrder/types'
// utils
import { decimal } from '@/utils/decimal'

interface FoodOrderDishItem {
  id: number // 菜品id
  name: string // 菜品名称
  mainImageUrl: string // 菜品主图url地址
  price: string // 价格
  num: number // 数量
}

// 订单列表
const orderList = ref<FoodOrderDishItem[]>([])

const remark = ref('')

// 合计总价
const totalPrice = computed(() => {
  // 单价和数量直接参与高精度运算，仅在最终合计时保留两位小数。
  const expression = orderList.value.map((item) => `(${item.price}) * ${item.num}`).join(' + ')
  return decimal(expression || '0')
})

// 确认下单
const confirmData = async () => {
  try {
    // 表单校验
    // const { valid } = await formRef.value?.validate()
    // if (!valid) return
    // loading.value = true
    const tempData: FoodOrderFormApi = {
      dishArr: orderList.value.map((item) => ({
        id: item.id,
        num: item.num
      })),
      remark: remark.value
    }
    await createFoodOrderApi(tempData)
    goToOrderPlaced()
  } catch (err) {
    // 接口请求失败
    console.error(err)
  } finally {
    // loading.value = false
  }
}

// 跳转"下单成功"页面
const goToOrderPlaced = () => {
  uni.navigateTo({
    url: '/views/food/orderPlaced/index'
  })
}

// 页面加载时触发
onLoad(() => {
  // 返回当前应用的页面栈数组(getCurrentPages()是 uni-app 提供的方法)
  const pages = getCurrentPages()
  // 取数组最后一个元素，也就是当前页面实例
  const currentPage = pages[pages.length - 1] as any
  // 返回当前页面与上一页之间的事件通道对象(getOpenerEventChannel()是 uni-app 页面实例上的方法)
  const eventChannel = currentPage?.getOpenerEventChannel()
  // 监听来源页面发送的事件
  eventChannel.on('cartData', (data: any[]) => {
    orderList.value = data
  })
})
</script>

<style lang="scss" scoped>
.confirm-order {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  .main {
    flex: 1;
    padding: 0 24rpx;

    .card-item {
      margin-bottom: 24rpx;
    }

    .order-list {
      .order-item {
        display: flex;
        margin-bottom: 16rpx;

        .order-img {
          width: 160rpx;
          height: 160rpx;
          text-align: center;
          line-height: 156rpx;
          background-color: #666;
          color: #fff;
          border-radius: 16rpx;
          overflow: hidden;
        }

        .order-content {
          flex: 1;
          padding: 0 20rpx;

          .order-name {
            color: $textDefault;
            height: 100rpx;
            font-size: 30rpx;
            font-weight: bold;
          }

          .price-num {
            display: flex;
            justify-content: space-between;

            .order-price {
              color: $theme;
              font-size: 32rpx;
              font-weight: bold;
            }

            .order-num {
              color: $textLight;
              font-size: 30rpx;
            }
          }
        }
      }

      .order-item:last-child {
        margin-bottom: 0;
      }
    }

    .order-remark {
      // margin-top: 40rpx;
    }
  }

  .footer {
    flex-shrink: 0;
    width: 100%;
    background-color: #fff;

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx;

      .footer-left {
        display: flex;
        align-items: center;

        .total-label {
          color: $textDefault;
          font-size: 30rpx;
          font-weight: bold;
        }

        .total-price {
          color: $theme;
          font-size: 40rpx;
          font-weight: bold;
        }
      }

      .footer-right {
        color: #fff;
        background-color: $theme;
        border-radius: 50rpx;
        padding: 16rpx 52rpx 20rpx 52rpx;
      }
    }
  }
}
</style>
