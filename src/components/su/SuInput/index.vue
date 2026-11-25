<template>
  <view :class="[props.hideBorder ? '' : 'input-border', 'su-input']">
    <!-- 单行文本框 -->
    <view v-if="props.type === 'text'">
      <wd-input v-model="modelValue" type="text" :placeholder="props.placeholder" :clearable="props.clearable" />
    </view>
    <!-- 多行文本框 -->
    <view v-if="props.type === 'textarea'">
      <wd-textarea v-model="modelValue" :placeholder="props.placeholder" :clearable="props.clearable" :maxlength="props.maxLength" :show-word-limit="props.showWordLimit" />
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
  type?: string // input框类型：text | textarea
  placeholder?: string // 占位符
  clearable?: boolean // 是否显示清除按钮
  maxLength?: number // 允许输入的最大字数
  showWordLimit?: boolean // 是否显示字数统计
  hideBorder?: boolean // 是否隐藏边框
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '请输入',
  clearable: false,
  maxLength: -1,
  showWordLimit: false,
  hideBorder: false
})

// 自动接收modelValue，并通过update:modelValue同步父组件
const modelValue = defineModel<string>({ default: '' })
</script>

<style lang="scss" scoped>
.su-input {
  // display: flex;
  border-radius: 12rpx;
  overflow: hidden;
}
.input-border {
  border: 2rpx solid #e8e5da;
}

:deep(.wd-input) {
  padding: 12rpx 16rpx 14rpx 18rpx;
}
</style>
