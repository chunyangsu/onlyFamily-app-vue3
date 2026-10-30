<template>
  <view class="su-icon"> 1 </view>
</template>

<script lang="ts">
export default {
  name: 'SuIcon' // 图标展示组件
}
</script>
<script setup lang="ts">
// 全局属性
// api
// ts
// utils

// props属性
interface Props {
  // id?: number // 获取图片的数据id
  // src?: string // 图片地址
  // name?: string // 图片名称
  // type?: string // 类型：头像avatar
  // width?: string // 宽度
  // height?: string // 高度
  // module?: string // 所属业务模块
}

const props = withDefaults(defineProps<Props>(), {
  // id: 0,
  // src: '',
  // name: '',
  // type: '',
  // width: '100%',
  // height: '100%',
  // module: ''
})

const localSrc = ref('')
</script>

<style lang="scss" scoped>
.su-icon {}
</style>
