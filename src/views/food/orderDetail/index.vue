<template>
  <view class="su-container order-detail">
    <!-- 订单状态 -->
    <!-- <view class="order-status">订单状态</view> -->
    <!-- 订单信息 -->
    <view class="card-item">
      <SuCard title="订单信息">
        <view class="order-info">
          <view class="order-info-row">
            <view class="order-info-label">订单编号：</view>
            <view class="order-info-value order-code">
              <view>{{ formData.code }}</view>
              <view class="copy-btn">复制</view>
            </view>
          </view>
          <view class="order-info-row m-t-26rpx">
            <view class="order-info-label">下单时间：</view>
            <view class="order-info-value">{{ formData.createTime }}</view>
          </view>
          <view class="order-info-row m-t-8rpx">
            <view class="order-info-label">下单用户：</view>
            <view class="order-info-value user-info">
              <view class="user-avatar">头像</view>
              <view class="user-name">{{ formData.creator }}</view>
            </view>
          </view>
        </view>
      </SuCard>
    </view>
    <!-- 菜品列表 -->
    <view class="card-item">
      <SuCard title="菜品清单">
        <view class="order-dish">
          <view class="dish-list">
            <view v-for="(val, index) in formData.dishArr" :key="index" class="dish-item">
              <view class="dish-img">
                <SuImage :src="val.mainImageUrl" />
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
          <view class="dish-total">
            <view>共 {{ formData.dishArr.length }} 份</view>
            <view class="total-price">
              <view class="total-price-label">合计：</view>
              <view class="total-price-value">￥ {{ totalPrice }}</view>
            </view>
          </view>
        </view>
      </SuCard>
    </view>
    <!-- 订单备注 -->
    <view class="card-item">
      <SuCard title="订单备注">
        <view class="order-remark">{{ formData.remark }}</view>
      </SuCard>
    </view>
    <!-- 操作栏 -->
    <view class="btn-bar">
      <!-- 评价 -->
      <!-- 再来一单 -->
    </view>
  </view>
</template>

<script setup lang="ts">
// 全局属性
// api
import { getFoodOrderDetailApi } from '@/api/modules/food/foodOrder'
// ts
// import type { FoodOrderFormApi } from '@/api/modules/food/foodOrder/types'
// utils
import { parseTime } from '@/utils/time'
import { decimal } from '@/utils/decimal'

interface FormData {
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

const formData = ref<FormData>({
  id: 0,
  code: '',
  progress: '',
  remark: '',
  dishArr: [],
  createId: 0,
  creator: '',
  createTime: ''
})

// 获取食物订单详情
const getDetail = async () => {
  getFoodOrderDetailApi(3).then((response: any) => {
    formData.value = {
      id: response.id,
      code: response.code,
      progress: response.progress,
      remark: response.remark,
      dishArr: [],
      createId: response.createId,
      creator: response.creator,
      createTime: parseTime(response.createTime, '{y}-{m}-{d} {h}:{i}:{s}')
    }
    if (response.dishArr && response.dishArr.length > 0) {
      response.dishArr.forEach((val: any) => {
        formData.value.dishArr.push({
          id: val.id,
          name: val.name,
          mainImageUrl: val.mainImageUrl,
          price: val.price,
          num: val.num
        })
      })
    }
  })
}

// 合计总价
const totalPrice = computed(() => {
  // 单价和数量直接参与高精度运算，仅在最终合计时保留两位小数
  const expression = formData.value.dishArr.map((item) => `(${item.price}) * ${item.num}`).join(' + ')
  return decimal(expression || '0')
})

// 页面加载时触发
onLoad(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
.order-detail {
  padding: 0 24rpx;
  padding-bottom: 40rpx;

  .card-item {
    margin-bottom: 24rpx;
  }
  .order-info {
    .order-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .order-code {
        display: flex;
        .copy-btn {
          margin-left: 12rpx;
          background-color: $themeBg;
          border-radius: 16rpx;
          padding: 2rpx 16rpx;
          color: $textDefault;
        }
      }
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
          margin-left: 24rpx;
        }
      }
    }
  }
  .order-dish {
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
          padding-left: 20rpx;

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
    .dish-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24rpx;
      .total-price {
        display: flex;
        align-items: center;
        .total-price-label {
          color: $textDefault;
          font-size: 30rpx;
          font-weight: bold;
        }

        .total-price-value {
          color: $theme;
          font-size: 40rpx;
          font-weight: bold;
        }
      }
    }
  }
  .order-remark {
  }
  .btn-bar {
  }
}
</style>
