<template>
  <view class="container">
    <view class="main">
      <!-- 搜索栏 -->
      <!-- <view class="search">
      <view class="search-input">
        <input type="text" placeholder="请输入搜索内容" />
      </view>
      <view class="search-btn">
        <button>搜索</button>
      </view>
    </view> -->
      <!-- 顶部tab导航 -->
      <view class="top-tab">
        <!-- <wd-tabs v-model="navTab" @change="changeNavTab">
        <wd-tab :title="`我要点餐`" name="order" />
        <wd-tab :title="`添加菜品`" name="add" />
      </wd-tabs> -->
        <view>
          <wd-button @click="goToFoodOrder">订单管理</wd-button>
          <wd-button @click="goToAddDish">添加菜品</wd-button>
        </view>
      </view>
      <view class="order-food">
        <wd-sidebar v-model="active">
          <wd-sidebar-item v-for="(item, index) in categoryList" :key="index" :value="item.value" :label="item.label" />
        </wd-sidebar>
        <!-- <scroll-view class="page-sidebar-demo1__content" scroll-y scroll-with-animation :scroll-top="scrollTop"
        :throttle="false" @scroll="onScroll"> -->
        <view class="order-food-content">
          <view v-for="(item, index) in dishList" :key="index" class="dish-item">
            <view class="dish-img">主图</view>
            <view class="dish-content">
              <view class="dish-name">{{ item.name }}</view>
              <view class="dish-price">价格：{{ item.price }}</view>
              <view class="dish-btn-bar">
                <view class="sale-num">销量：{{ item.saleNum }}</view>
                <view class="cart-box">
                  <view v-if="item.cartNum > 0" class="minus-btn" @click="item.cartNum--">-</view>
                  <view v-if="item.cartNum > 0" class="cart-num">{{ item.cartNum }}</view>
                  <view class="plus-btn" @click="item.cartNum++">+</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- </scroll-view> -->
      </view>
    </view>
    <!-- 购物车 -->
    <view class="footer">
      <view class="cart">
        <view class="cart-num">购物车：{{ cartData.length }}</view>
        <view class="cart-price">总计：{{ cartPriceTotal }}</view>
      </view>
      <view class="btn-bar">
        <view @click="goToConfirmOrder">下单</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// api
import { getDishCategoryListApi } from '@/api/modules/food/category'
import { getDishListApi } from '@/api/modules/food/dish'
// ts
import type { DishCategoryItem } from '@/api/modules/food/category/types'
import type { DishItem } from '@/api/modules/food/dish/types'

// 跳转"订单管理"页面
const goToFoodOrder = () => {
  uni.navigateTo({
    url: '/views/food/foodOrder/index'
  })
}
// 跳转"添加菜品"页面
const goToAddDish = () => {
  uni.navigateTo({
    url: '/views/food/addDish/index'
  })
}

interface FoodOrderDishItem {
  id: number // 菜品id
  name: string // 菜品名称
  categoryId: number // 分类id
  price: string // 价格
  num: number // 数量
}

// 跳转"确认订单"页面
const goToConfirmOrder = () => {
  if (cartData.value.length === 0) {
    // uni.showToast({
    //   title: '请先选择菜品',
    //   icon: 'none'
    // })
    return
  }
  const tempArr: FoodOrderDishItem[] = []
  cartData.value.forEach((item) => {
    tempArr.push({
      id: item.id,
      name: item.name,
      categoryId: item.categoryId,
      price: item.price,
      num: item.cartNum
    })
  })
  uni.navigateTo({
    url: '/views/food/confirmOrder/index',
    success(res) {
      res.eventChannel.emit('cartData', tempArr)
    }
  })
}

const active = ref(0)

const categoryList = ref<DishCategoryItem[]>([])

// 获取菜品分类列表
const getDishCategoryList = async () => {
  getDishCategoryListApi().then((res: any) => {
    categoryList.value = []
    res.forEach((item: any) => {
      categoryList.value.push({
        value: item.id.toString(),
        label: item.name
      })
    })
  })
}

// 菜品列表
const dishList = ref<DishItem[]>([])

// 获取菜品列表
const getDishList = async () => {
  getDishListApi().then((res: any) => {
    dishList.value = []
    res.forEach((item: any) => {
      dishList.value.push({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        price: item.price,
        saleNum: 0,
        cartNum: 0
      })
    })
  })
}

// 购物车数据(已选菜品及数量)
const cartData = computed(() => {
  let tempArr: DishItem[] = []
  dishList.value.forEach((item) => {
    if (item.cartNum > 0) {
      tempArr.push(item)
    }
  })
  return tempArr
})

// 计算购物车总价
const cartPriceTotal = computed(() => {
  let total = 0
  dishList.value.forEach((item) => {
    total += item.cartNum * parseFloat(item.price)
  })
  return total.toFixed(2)
})

// 页面加载时获取分类列表
onLoad(() => {
  getDishCategoryList()
  getDishList()
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  .main {
    flex: 1;
  }
}

.order-food {
  display: flex;

  .order-food-content {
    flex: 1;

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
          // font-weight: bold;
        }

        .dish-price {
          font-size: 14px;
          margin-top: 4px;
        }
      }

      .dish-btn-bar {
        margin-top: 4px;
        display: flex;
        align-items: center;

        .sale-num {
          flex: 1;
          font-size: 14px;
        }

        .cart-box {
          display: flex;

          .minus-btn {
            width: 20px;
            height: 20px;
            line-height: 18px;
            text-align: center;
            color: #666;
            background-color: #fff;
            border-radius: 50%;
            border: 1px solid #666;
          }

          .cart-num {
            margin: 0 8px;
          }

          .plus-btn {
            width: 20px;
            height: 20px;
            line-height: 18px;
            text-align: center;
            color: white;
            background-color: green;
            border-radius: 50%;
          }
        }
      }
    }
  }
}

.footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  // background: #fff;
  border-top: 1rpx solid #eee;

  justify-content: space-between;
  border-radius: 8px;
  margin: 0 10px;
  padding: 8px;
  // box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.1);

  .cart {
    display: flex;

    .cart-price {
      margin-left: 10px;
    }
  }
}
</style>
