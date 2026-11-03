<template>
  <view class="su-container food-menu">
    <view class="main">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-icon">
          <wd-icon name="search-line" size="24px"></wd-icon>
        </view>
        <view class="search-input">
          <input type="text" placeholder="搜索菜品名称" />
        </view>
      </view>
      <!-- 顶部菜单栏 -->
      <view class="top-nav">
        <view class="nav-item" @click="goToFoodOrder">
          <view class="nav-icon">
            <SuImage name="random-meal.png"></SuImage>
          </view>
          <view class="nav-name">随机套餐</view>
        </view>
        <view class="nav-item" @click="goToFoodOrder">
          <view class="nav-icon">
            <SuImage name="favorites.png"></SuImage>
          </view>
          <view class="nav-name">我的收藏</view>
        </view>
        <view class="nav-item" @click="goToFoodOrder">
          <view class="nav-icon">
            <SuImage name="order-manage.png"></SuImage>
          </view>
          <view class="nav-name">订单管理</view>
        </view>
        <view class="nav-item" @click="goToAddDish">
          <view class="nav-icon">
            <SuImage name="add-dish.png"></SuImage>
          </view>
          <view class="nav-name">添加菜品</view>
        </view>
      </view>
      <view class="order-food">
        <!-- 左侧分类 -->
        <view class="order-food-left">
          <view v-for="(item, index) in categoryList" :key="index"
            :class="[activedCategory === item.id ? 'active' : '', 'cate-item']">
            <!-- <view class="cate-icon"></view> -->
            <view class="cate-name">{{ item.name }}</view>
          </view>
        </view>
        <!-- 右侧菜品列表 -->
        <view class="order-food-right">
          <view class="food-content-header">
            <view class="header-title">
              <view class="title-border"></view>
              <view class="title-text">荤菜</view>
            </view>
            <view class="header-total">共12道菜</view>
          </view>
          <view class="dish-list">
            <view v-for="(item, index) in dishList" :key="index" class="dish-item">
              <!-- 主图 -->
              <view class="dish-img">
                <SuImage :src="item.attachmentUrl"></SuImage>
              </view>
              <!-- 详情信息 -->
              <view class="dish-content">
                <view class="dish-name">{{ item.name }}</view>
                <view class="dish-price">￥{{ item.price }}</view>
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
        </view>
      </view>
    </view>
    <!-- 购物车 -->
    <view class="footer">
      <view class="left-cart">
        <view class="cart-num">
          <view class="cart-icon">
            <SuImage name="cart.png"></SuImage>
          </view>
          <view class="dish-num">{{ selectedDishTotal }}</view>
        </view>
        <view class="cart-dish-type">共 {{ cartData.length }} 种菜品</view>
        <view class="cart-price">￥{{ cartPriceTotal }}</view>
      </view>
      <view class="right-btn" @click="goToConfirmOrder">下单</view>
    </view>
  </view>
</template>

<script setup lang="ts">
// api
import { getDishCategoryListApi } from '@/api/modules/food/category'
import { getDishListApi } from '@/api/modules/food/dish'
import { getAttachmentListApi } from '@/api/common/attachment'
// ts
import type { DishCategoryItem } from '@/pages/foodMenu/types'
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
  price: number // 价格
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

// 已选分类
const activedCategory = ref(1)
// 分类列表
const categoryList = ref<DishCategoryItem[]>([])

// 获取菜品分类列表
const getDishCategoryList = async () => {
  getDishCategoryListApi().then((res: any) => {
    categoryList.value = []
    res.forEach((item: any) => {
      categoryList.value.push({
        id: item.id,
        name: item.name
      })
    })
  })
}

// 菜品列表
const dishList = ref<DishItem[]>([])

// 获取菜品列表
const getDishList = async () => {
  const tempIdArr: number[] = []
  getDishListApi().then((response: any) => {
    dishList.value = []
    response.forEach((item: any) => {
      dishList.value.push({
        id: item.id,
        name: item.name,
        attachmentId: item.attachmentId,
        attachmentUrl: '',
        categoryId: item.categoryId,
        price: item.price,
        saleNum: 0,
        cartNum: 0
      })
      tempIdArr.push(item.attachmentId)
    })
    // 获取对应的附件
    getAttachmentListApi({ idArr: tempIdArr }).then((res: any[]) => {
      if (res && res.length > 0) {
        res.forEach((item) => {
          dishList.value.forEach((val) => {
            if (val.attachmentId === item.id) {
              val.attachmentUrl = item.url
            }
          })
        })
      }
    })
  })
}

// 已选菜品数量的总计
const selectedDishTotal = computed(() => {
  let total = 0
  dishList.value.forEach((item) => {
    if (item.cartNum > 0) {
      total += item.cartNum
    }
  })
  return total
})

// 购物车数据(已选菜品)
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
    total += item.cartNum * item.price
  })
  return total.toFixed(2)
})

// 页面加载时获取分类列表
onLoad(() => {
  getDishCategoryList()
  getDishList()
})

onShow(() => {
  getDishList()
})
</script>

<style lang="scss" scoped>
.food-menu {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  .main {
    flex: 1;
  }
}

.search-bar {
  display: flex;
  background-color: #fff;
  border-radius: 32rpx;
  border: 2rpx solid $line;
  padding: 8rpx 16rpx;
  margin: 0 24rpx;

  .search-input {
    flex: 1;
    margin-left: 16rpx;
  }
}

.top-nav {
  margin: 0 24rpx;
  margin-top: 32rpx;
  display: flex;
  gap: 24rpx;

  .nav-item {
    flex: 1;
    background-color: #f0f1e1;
    border-radius: 24rpx;
    padding: 24rpx 0;
    text-align: center;

    .nav-icon {
      width: 60rpx;
      height: 60rpx;
      line-height: 58rpx;
      text-align: center;
      margin: 0 auto;
    }

    .nav-name {
      color: $textDefault;
    }
  }
}

.order-food {
  display: flex;
  margin-top: 40rpx;
  margin-right: 24rpx;

  // 左侧分类
  .order-food-left {
    width: 150rpx;

    .cate-item {
      text-align: center;
      padding: 32rpx 0;
      border-left: 8rpx solid $pageBg;
      border-radius: 0 16rpx 16rpx 0;
      // .cate-icon {}

      .cate-name {
        color: $textLight;
      }
    }

    .cate-item.active {
      border-left: 8rpx solid $theme;
      background-color: $themeBg;

      .cate-name {
        color: $theme;
      }
    }
  }

  // 右侧菜品列表

  .order-food-right {
    flex: 1;
    margin-left: 24rpx;

    .food-content-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24rpx;

      .header-title {
        display: flex;

        .title-border {
          background-color: $theme;
          width: 8rpx;
          height: 100%;
          margin-right: 16rpx;
          border-radius: 8rpx;
        }

        .title-text {
          color: $textDark;
          font-weight: bold;
        }
      }

      .header-total {
        color: $textLight;
      }
    }

    .dish-list {
      .dish-item {
        display: flex;
        margin-bottom: 16rpx;

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
            font-weight: bold;
            color: $textDark;
          }

          .dish-price {
            font-size: 28rpx;
            margin-top: 8rpx;
            font-size: 32rpx;
            color: $theme;
          }
        }

        .dish-btn-bar {
          margin-top: 8rpx;
          display: flex;
          align-items: center;

          .sale-num {
            flex: 1;
            font-size: 28rpx;
            color: $textLight;
          }

          .cart-box {
            display: flex;

            .minus-btn {
              width: 40rpx;
              height: 40rpx;
              line-height: 30rpx;
              text-align: center;
              color: $textDefault;
              background-color: #fff;
              font-size: 46rpx;
              border-radius: 50%;
              border: 2rpx solid $theme;
            }

            .cart-num {
              margin: 0 16rpx;
            }

            .plus-btn {
              width: 40rpx;
              height: 40rpx;
              line-height: 34rpx;
              text-align: center;
              color: white;
              background-color: $theme;
              font-size: 36rpx;
              border-radius: 50%;
            }
          }
        }
      }
    }
  }
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 50rpx;
  padding: 16rpx;
  background-color: #f0f1e1;
  margin: 0 24rpx;
  margin-bottom: 24rpx;

  .left-cart {
    display: flex;
    align-items: center;

    .cart-num {
      position: relative;

      .cart-icon {
        width: 70rpx;
        height: 70rpx;
        line-height: 68rpx;
        text-align: center;
      }

      .dish-num {
        position: absolute;
        top: -4rpx;
        right: -24rpx;
        color: #fff;
        background-color: $theme;
        border-radius: 24rpx;
        padding: 0 12rpx 2rpx 12rpx;
      }
    }

    .cart-dish-type {
      margin-left: 38rpx;
    }

    .cart-price {
      margin-left: 24rpx;
    }
  }

  .right-btn {
    color: #fff;
    background-color: $theme;
    border-radius: 50rpx;
    padding: 16rpx 52rpx 20rpx 52rpx;
  }
}
</style>
