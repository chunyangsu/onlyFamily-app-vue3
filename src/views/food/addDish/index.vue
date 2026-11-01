<template>
  <view class="su-container add-dish">
    <!-- 表单 -->
    <view class="main">
      <view class="card-item">
        <SuFormItem title="菜品主图" required>
          <SuUpload v-model="attachmentList" module="dish" accept="image" />
        </SuFormItem>
      </view>
      <view class="card-item">
        <SuFormItem title="菜品名称" required>
          <SuInput v-model="formData.name" placeholder="请输入菜品名称" />
        </SuFormItem>
      </view>
      <view class="card-item">
        <SuFormItem title="选择分类" required>
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
        <SuFormItem title="价格">
          <view class="dish-price">
            <!-- <view class="price-code">￥</view> -->
            <view class="price-input">
              <SuInputNumber v-model="formData.price" />
            </view>
            <view class="dish-unit">/ 份</view>
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

// const formRef = ref()

// 表单数据
const formData = ref<DishForm>({
  name: '',
  attachmentId: 0,
  categoryId: 0,
  introduction: '',
  makeProcess: '',
  price: ''
})

const attachmentList = ref<number[]>([])
const categoryArr = ref<string[]>([])
const categoryList = ref<DishCategoryItem[]>([])

// 表单校验
// const schema = zodAdapter(
//   z.object({
//     name: z.string(),
//     categoryId: z.number()
//   })
// )

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

// 保存
const saveData = async () => {
  try {
    // 表单校验
    // const { valid } = await formRef.value?.validate()
    // if (!valid) return
    // loading.value = true
    const tempData: DishForm = {
      name: formData.value.name,
      attachmentId: attachmentList.value[0],
      categoryId: Number(categoryArr.value[0]),
      introduction: formData.value.introduction,
      makeProcess: formData.value.makeProcess,
      price: formData.value.price
    }
    const response = await createDishApi(tempData)
    console.log(response)
  } catch (err) {
    // 接口请求失败
    console.error(err)
  } finally {
    // loading.value = false
  }
}

// 发布菜品
// const publishDish = () => { }

// 页面加载时触发
onLoad(() => {
  getDishCategoryList()
})
</script>

<style lang="scss" scoped>
.add-dish {
  display: flex;
  flex-direction: column;
  // align-items: center;
  // justify-content: center;
  padding: 0 24rpx;
  padding-bottom: 160rpx;

  .main {
    .card-item {
      margin-bottom: 24rpx;
    }

    .dish-price {
      // border: 2rpx solid #e8e5da;
      // border-radius: 12rpx;
      // overflow: hidden;
      display: flex;
      align-items: center;

      .price-input {
        flex: 1;
        margin: 0 12rpx;
      }
    }
  }

  .footer {
    position: fixed;
    bottom: 32rpx;
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
