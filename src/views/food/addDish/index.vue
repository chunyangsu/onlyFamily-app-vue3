<template>
  <view class="container">
    <!-- 表单 -->
    <view class="main">
      <wd-form ref="formRef" :model="formData" :schema="schema" :title-width="100">
        <!-- 上传主图 -->
        <!-- <wd-form-item title="上传主图" required prop="fileList">
          <wd-upload v-model:file-list="fileList" accept="image" image-mode="aspectFill" :action="action"
            :success-status="[200, 201]"></wd-upload>
        </wd-form-item> -->
        <!-- 菜品名称 -->
        <wd-form-item title="菜品名称" required prop="name">
          <wd-input v-model="formData.name" placeholder="请输入" />
        </wd-form-item>
        <!-- 菜品分类 -->
        <wd-form-item title="选择分类" required prop="categoryId">
          <wd-cell placeholder="请选择" :value="selectedCategoryLabel" is-link @click="show = true" />
          <wd-picker v-model="categoryArr" v-model:visible="show" :columns="categoryList" />
        </wd-form-item>
        <!-- 菜品介绍 -->
        <wd-form-item title="菜品介绍">
          <wd-textarea v-model="formData.introduction" placeholder="请输入" />
        </wd-form-item>
        <!-- 制作过程 -->
        <wd-form-item title="制作过程">
          <wd-textarea v-model="formData.makeProcess" placeholder="请输入" />
        </wd-form-item>
        <!-- 价格 -->
        <wd-form-item title="价格">
          <wd-input-number v-model="formData.price" :precision="2" disable-plus disable-minus />
        </wd-form-item>
      </wd-form>
    </view>
    <!-- 底部按钮 -->
    <view class="footer">
      <wd-button type="success" @click="saveData">保存</wd-button>
      <!-- <wd-button type="success" @click="publishDish">发布菜品</wd-button> -->
    </view>
  </view>
</template>

<script setup lang="ts">
// api
import { getDishCategoryListApi } from '@/api/modules/food/category'
import { createDishApi } from '@/api/modules/food/dish'
// ts
// import type { UploadFile } from '@/uni_modules/wot-ui/components/wd-upload/types'
import type { DishCategoryItem } from '@/api/modules/food/category/types'
import type { DishForm } from '@/api/modules/food/dish/types'
import { z } from 'zod'
import { zodAdapter } from '@wot-ui/ui'

const formRef = ref()

// 表单数据
const formData = ref<DishForm>({
  name: '',
  categoryId: 0,
  introduction: '',
  makeProcess: '',
  price: ''
})

const action = 'https://69bd04402bc2a25b22ad0a49.mockapi.io/upload'

// const fileList = ref<UploadFile[]>([
//   {
//     url: 'https://wot-ui.cn/assets/panda.jpg'
//   }
// ])

const categoryArr = ref<string[]>([])

const categoryList = ref<DishCategoryItem[]>([])

// 表单校验
const schema = zodAdapter(
  z.object({
    name: z.string(),
    categoryId: z.number()
  })
)

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
    const { valid } = await formRef.value?.validate()
    if (!valid) return
    // loading.value = true
    const tempData = {
      name: formData.value.name,
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
const publishDish = () => { }

// 页面加载时获取分类列表
onLoad(() => {
  getDishCategoryList()
})
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .main {
    width: 100%;
  }

  .footer {
    margin-top: 10px;
  }
}
</style>
