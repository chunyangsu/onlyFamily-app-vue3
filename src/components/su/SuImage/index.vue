<template>
  <view class="su-image">
    <wd-img :width="props.width" :height="props.height" :src="localSrc" />
  </view>
</template>

<script lang="ts">
export default {
  name: 'SuImage' // 图片展示组件
}
</script>
<script setup lang="ts">
// 全局属性
// api
// ts
// utils

// props属性
interface Props {
  id?: number // 获取图片的数据id
  src?: string // 图片地址
  name?: string // 图片名称
  type?: string // 类型
  width?: string // 宽度
  height?: string // 高度
  module?: string // 所属业务模块
  access?: 'private' | 'public' // 权限：私有、公有
  source?: 'local' | 'oss' // 来源
}

const props = withDefaults(defineProps<Props>(), {
  id: 0,
  src: '',
  name: '',
  type: '',
  width: '100%',
  height: '100%',
  module: '',
  access: 'private',
  source: 'oss'
})

const localSrc = ref('')

// 获取本地图片地址
const getImageUrl = (name: string) => {
  const src = `/static/images/${name}`
  return src
}

watchEffect(() => {
  if (props.src !== '') {
    // 指定地址
    localSrc.value = props.src
  } else if (props.name !== '') {
    // 图片名称
    if (props.source === 'oss') {
      // 阿里云OSS
      localSrc.value = 'https://only-family-static.oss-cn-shanghai.aliyuncs.com/' + props.name
    } else {
      // 本地
      localSrc.value = getImageUrl(props.name)
    }
  }
})
</script>

<style lang="scss" scoped>
.su-image {
  // display: flex;
  width: 100%;
  height: 100%;
}
</style>
