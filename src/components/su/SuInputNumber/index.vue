<template>
  <view class="su-input-number">
    <view class="money-input">
      <!-- 前缀 -->
      <view class="prefix">
        <slot name="prefix"></slot>
      </view>
      <!-- 输入框 -->
      <view class="input-area">
        <wd-input :model-value="inputValue" type="digit" :placeholder="props.placeholder"
          :align-right="props.alignRight" @input="handleInput" @blur="handleBlur"></wd-input>
      </view>
      <!-- 后缀 -->
      <view class="suffix">
        <slot name="suffix"></slot>
      </view>
    </view>
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

// props属性
interface Props {
  type?: string // 类型
  placeholder?: string // 占位符
  alignRight?: boolean // 是否右侧对齐
  // disabled?: boolean
  // readonly?: boolean
  // clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: '',
  placeholder: '',
  alignRight: false
  // disabled: false,
  // readonly: false,
  // clearable: false
})

const modelValue = defineModel<string | number>({
  default: ''
})

// 在值改变时触发
const handleInput = (event: { value: string }) => {
  modelValue.value = formatInput(event.value)
}

/**
 * 金额输入过滤
 * 1. 只保留数字和小数点
 * 2. 只允许一个小数点
 * 3. 小数点后最多两位
 */
const formatInput = (value: string | number): string => {
  let result = String(value ?? '')
  // 过滤非数字和小数点字符
  result = result.replace(/[^\d.]/g, '')
  // 只保留第一个小数点
  const dotIndex = result.indexOf('.')
  if (dotIndex !== -1) {
    result = result.slice(0, dotIndex + 1) + result.slice(dotIndex + 1).replace(/\./g, '')
  }
  // 限制小数点后两位
  const parts = result.split('.')
  if (parts.length > 1) {
    result = `${parts[0]}.${parts[1].slice(0, 2)}`
  }
  // 整数部分去除多余前导零
  const [integer, decimal] = result.split('.')
  const normalizedInteger = integer.replace(/^0+(?=\d)/, '')
  if (result.includes('.')) {
    return `${normalizedInteger}.${decimal ?? ''}`
  }
  return normalizedInteger
}

// 失焦时补齐两位小数
const handleBlur = () => {
  if (modelValue.value === '') return
  const value = formatInput(modelValue.value)
  const [integer, decimal = ''] = value.split('.')
  modelValue.value = `${integer}.${decimal.padEnd(2, '0')}`
}

// 统一输入框值
const inputValue = computed(() => String(modelValue.value ?? ''))
</script>

<style lang="scss" scoped>
.su-input-number {
  border: 2rpx solid #e8e5da;
  border-radius: 12rpx;
  overflow: hidden;

  .money-input {
    display: flex;

    .input-area {
      flex: 1;
    }

    .prefix {}

    .suffix {}
  }
}
</style>
