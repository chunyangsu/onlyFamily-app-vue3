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
  type?: string // 类型：头像avatar
  width?: string // 宽度
  height?: string // 高度
  module?: string // 所属业务模块
}

const props = withDefaults(defineProps<Props>(), {
  id: 0,
  src: '',
  name: '',
  type: '',
  width: '100%',
  height: '100%',
  module: ''
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
    localSrc.value = getImageUrl(props.name)
  } else if (props.type === 'avatar') {
    // 头像
    // getAvatar()
  }
  // 图片预览
  // if (props.preview) {
  //   previewImageList.value = []
  //   if (props.previewList.length > 0) {
  //     // 外部传入预览图片地址
  //     previewImageList.value = props.previewList
  //   } else {
  //     previewImageList.value.push(getImageUrl(`${props.name}`))
  //   }
  // }
  // 头像
  // avatarWidth.value = props.width !== '' ? props.width : '24px'
  // avatarHeight.value = props.height !== '' ? props.height : '24px'
  // if (props.fit !== '') {
  //   localFit.value = props.fit
  // } else if (props.type === 'avatar') {
  //   localFit.value = 'fill'
  // } else {
  //   localFit.value = 'contain'
  // }

  // if (props.fontSize > 0) {
  //   localfontsize.value = props.fontSize + 'px'
  // }
})
</script>

<style lang="scss" scoped>
.su-image {
  // display: flex;
  width: 100%;
  height: 100%;
}
</style>
