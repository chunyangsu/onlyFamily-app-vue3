<template>
  <view class="su-container add-dish">
    <!-- 表单 -->
    <view class="main">
      <view class="card-item">
        <SuFormItem title="菜品主图" required>
          <SuUpload v-model="attachmentList" module="food" moduleType="dish" accept="image" />
        </SuFormItem>
      </view>
      <view class="card-item">
        <SuFormItem title="菜品名称" required>
          <SuInput v-model="formData.name" placeholder="请输入菜品名称" />
        </SuFormItem>
      </view>
      <view class="card-item">
        <SuFormItem title="菜品分类" required>
          <wd-cell placeholder="请选择" :value="selectedCategoryLabel" is-link @click="show = true" />
          <wd-picker v-model="categoryArr" v-model:visible="show" :columns="categoryList" />
        </SuFormItem>
      </view>
      <view class="card-item">
        <SuFormItem title="菜品介绍">
          <SuInput v-model="formData.introduction" type="textarea" placeholder="请输入菜品介绍" />
        </SuFormItem>
      </view>
      <view class="card-item">
        <SuFormItem title="制作过程">
          <SuInput v-model="formData.makeProcess" type="textarea" placeholder="请输入制作过程" />
        </SuFormItem>
      </view>
      <view class="card-item">
        <SuFormItem title="价格" required>
          <view class="dish-price">
            <SuInputNumber v-model="formData.price" placeholder="请输入价格">
              <template #prefix>
                <view class="money-icon">￥</view>
              </template>
              <template #suffix>
                <view class="dish-unit">/ 份</view>
              </template>
            </SuInputNumber>
          </view>
        </SuFormItem>
      </view>
    </view>
    <!-- 底部按钮 -->
    <view class="footer" @click="saveData">发布菜品</view>
  </view>
</template>

<script setup lang="ts">
// api
import { getDishCategoryListApi } from '@/api/modules/food/category'
import { createDishApi } from '@/api/modules/food/dish'
// ts
import type { DishCategoryItem } from '@/api/modules/food/category/types'
import type { DishForm } from '@/api/modules/food/dish/types'

const pageProxy = getCurrentInstance()?.proxy as { getOpenerEventChannel?: () => UniApp.EventChannel } | null | undefined

// 表单数据
const formData = ref<DishForm>({
  name: '',
  mainImageId: 0,
  categoryId: 0,
  introduction: '',
  makeProcess: '',
  price: ''
})

const attachmentList = ref<number[]>([])
const categoryArr = ref<string[]>(['1'])
const categoryList = ref<DishCategoryItem[]>([])

const show = ref(false)

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

const selectedCategoryLabel = computed(() => {
  return categoryList.value.find((item) => item.value === categoryArr.value[0])?.label || ''
})

// const categoryName = ref('')
// 新建菜品分类
// const createDishCategory = () => {
//   const params = {
//     name: categoryName.value
//   }
//   createDishCategoryApi(params).then((response) => { })
// }

// 保存
const saveData = async () => {
  try {
    // 表单校验
    if (attachmentList.value.length === 0) {
      uni.showToast({ title: '菜品主图不能为空', icon: 'none' })
      return
    }
    if (formData.value.name.trim() === '') {
      uni.showToast({ title: '菜品名称不能为空', icon: 'none' })
      return
    }
    if (categoryArr.value.length === 0) {
      uni.showToast({ title: '菜品分类不能为空', icon: 'none' })
      return
    }
    if (formData.value.price.trim() === '') {
      uni.showToast({ title: '价格不能为空', icon: 'none' })
      return
    }

    const tempData: DishForm = {
      name: formData.value.name,
      mainImageId: attachmentList.value[0],
      categoryId: Number(categoryArr.value[0]),
      introduction: formData.value.introduction,
      makeProcess: formData.value.makeProcess,
      price: formData.value.price
    }
    await createDishApi(tempData)
    uni.showToast({
      title: '添加成功',
      icon: 'success'
    })

    setTimeout(() => {
      // 仅保存成功时通知来源页，来源页在返回显示后刷新列表
      const eventChannel = pageProxy?.getOpenerEventChannel?.()
      eventChannel?.emit('dishCreated')
      // 返回上一页
      uni.navigateBack({
        delta: 1
      })
    }, 1000)
  } catch (err) {
    // 接口请求失败
    console.error(err)
  }
}

// 页面加载时触发
onLoad(() => {
  getDishCategoryList()
})
</script>

<style lang="scss" scoped>
.add-dish {
  display: flex;
  flex-direction: column;
  padding: 0 24rpx;
  padding-bottom: 160rpx;

  .main {
    .card-item {
      margin-bottom: 24rpx;
    }

    .dish-price {
      .money-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 64rpx;
        height: 100%;
        background-color: #e7e7e7;
        font-size: 32rpx;
      }

      .dish-unit {
        display: flex;
        align-items: center;
        height: 100%;
        padding-right: 24rpx;
      }
    }
  }

  .footer {
    position: fixed;
    bottom: 48rpx;
    font-size: 32rpx;
    width: calc(100% - 48rpx);
    padding: 18rpx 0;
    border-radius: 50rpx;
    background-color: $theme;
    text-align: center;
    color: #fff;
  }
}
</style>
