<template>
  <view class="su-input">
    <!-- 单行文本框 -->
    <view v-if="props.type === 'text'">
      <wd-input v-model="props.modelValue" type="text" :placeholder="props.placeholder" :clearable="props.clearable"
        @input="handleInput" />
    </view>
    <!-- 多行文本框 -->
    <view v-if="props.type === 'textarea'">
      <wd-textarea v-model="props.modelValue" :placeholder="props.placeholder" :clearable="props.clearable"
        :maxlength="props.maxLength" :show-word-limit="props.showWordLimit" @input="handleInput" />
    </view>
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

defineOptions({
  options: {
    styleIsolation: 'shared'
  }
})

// props属性
interface Props {
  modelValue: string // 输入值
  type?: string // input框类型：text | textarea
  placeholder?: string // 占位符
  clearable?: boolean // 是否显示清除按钮
  maxLength?: number // 允许输入的最大字数
  showWordLimit?: boolean // 是否显示字数统计
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '请输入',
  clearable: false,
  maxLength: -1,
  showWordLimit: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 在input值改变时触发
const handleInput = (event: any) => {
  // console.log(event)
  emit('update:modelValue', event.value)
}
</script>

<style lang="scss" scoped>
.su-input {
  // display: flex;
  border: 2rpx solid #e8e5da;
  border-radius: 12rpx;
  overflow: hidden;
}

:deep(.wd-input) {
  padding: 12rpx 16rpx 14rpx 18rpx;
}
</style>
