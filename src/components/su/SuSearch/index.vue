<template>
  <view class="su-search">
    <!-- 图标 -->
    <view class="search-icon">
      <wd-icon name="search-line" size="24px" />
    </view>
    <!-- 输入框 -->
    <view class="search-input">
      <SuInput v-model="modelValue" :placeholder="props.placeholder" hide-border />
    </view>
    <!-- 按钮 -->
    <view class="search-btn" @click="handleSearch">搜索</view>
  </view>
</template>

<script lang="ts">
export default {
  name: 'SuSearch' // 搜索输入框组件
}
</script>
<script setup lang="ts">
// 全局属性
// api
// ts
// utils

// props属性
interface Props {
  placeholder?: string // 占位符
  // clearable?: boolean // 是否显示清除按钮
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请搜索'
  // clearable: false
})

// 自动接收modelValue，并通过update:modelValue同步父组件
const modelValue = defineModel<string>({ default: '' })

const emit = defineEmits<{
  search: [value: string]
}>()

// 搜索事件
const handleSearch = () => {
  emit('search', modelValue.value)
}
</script>

<style lang="scss" scoped>
.su-search {
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 50rpx;
  border: 2rpx solid $line;
  padding: 8rpx 24rpx;

  .search-icon {
  }
  .search-input {
    flex: 1;
  }
  .search-btn {
    color: $textLight;
  }
}
</style>
