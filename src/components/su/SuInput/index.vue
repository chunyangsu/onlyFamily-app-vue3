<template>
  <view class="su-input">
    <wd-input v-model="props.modelValue" type="text" placeholder="请输入用户名" @input="handleInput" />
  </view>
</template>

<script lang="ts">
export default {
  name: 'SuInput' // 输入框组件
}
</script>
<script setup lang="ts">
// 全局属性
// api
// ts
// utils

// props属性
interface Props {
  modelValue: string // 输入值
  type?: string // input框类型：text | textarea
  placeholder?: string // 占位符
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '请输入'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// const value = ref('')

function handleInput(event: any) {
  console.log(event)
}
</script>

<style lang="scss" scoped>
.su-input {
  // display: flex;
}
</style>
