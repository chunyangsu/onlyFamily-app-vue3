<template>
  <view class="su-input-number">
    <wd-input-number v-model="modelValue" :precision="2" @change="handleChange" />
  </view>
</template>

<script lang="ts">
export default {
  name: 'SuInputNumber' // 数字输入框组件
}
</script>
<script setup lang="ts">
// 全局属性
// api
// ts
// utils

defineOptions({
  options: {
    styleIsolation: 'shared'
  }
})

// props属性
interface Props {
  modelValue: string // 输入值
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// 在值改变时触发
const handleChange = (event: any) => {
  console.log(event)
}
</script>

<style lang="scss" scoped>
.su-input-number {
  // display: flex;
  border: 2rpx solid #e8e5da;
  border-radius: 12rpx;
  overflow: hidden;
}

:deep(.wd-input-number__action) {
  display: none;
}

:deep(.wd-input-number__inner) {
  width: 100%;
  background-color: #fff;
  text-align: left;
}
</style>
