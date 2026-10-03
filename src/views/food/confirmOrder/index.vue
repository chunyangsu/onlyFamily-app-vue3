<template>
  <view class="container">
    <view class="main">
      <!-- 订单列表 -->
      <view class="order-list">
        <view v-for="(item, index) in orderList" :key="index" class="order-item">
          <view class="order-name">{{ item.name }}</view>
          <view class="order-price">价格：{{ item.price }}</view>
          <view class="order-num">数量：{{ item.cartNum }}</view>
        </view>
      </view>
      <!-- 订单备注 -->
      <view class="order-remark">
        <wd-textarea placeholder="请输入订单备注" />
      </view>
    </view>
    <!-- 底部按钮 -->
    <view class="footer">
      <wd-button type="success" @click="confirmData">确认下单</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'
// api
import { getDishCategoryListApi } from '@/api/modules/food/category'
import { createDishApi } from '@/api/modules/food/dish'
// ts
// import type { UploadFile } from '@/uni_modules/wot-ui/components/wd-upload/types'
import type { DishCategoryItem } from '@/api/modules/food/category/types'
import type { DishItem } from '@/api/modules/food/dish/types'

// 订单列表
const orderList = ref<DishItem[]>([])

// 确认下单
const confirmData = async () => {
  // try {
  //   // 表单校验
  //   const { valid } = await formRef.value?.validate()
  //   if (!valid) return
  //   // loading.value = true
  //   const tempData = {
  //     name: formData.value.name,
  //     categoryId: Number(categoryArr.value[0]),
  //     introduction: formData.value.introduction,
  //     makeProcess: formData.value.makeProcess,
  //     price: formData.value.price
  //   }
  //   const response = await createDishApi(tempData)
  //   console.log(response)
  // } catch (err) {
  //   // 接口请求失败
  //   console.error(err)
  // } finally {
  //   // loading.value = false
  // }
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
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;

  .main {
    flex: 1;
  }

  .footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx 32rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background: #fff;
    border-top: 1rpx solid #eee;
  }
}
</style>
