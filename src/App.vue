<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()

onLaunch(async () => {
  // console.log('App Launch')
  await userStore.initUserStore()
  if (userStore.token) {
    uni.reLaunch({
      url: '/pages/index/index'
    })
  }
})
onShow(() => {
  // console.log('App Show')
})
onHide(() => {
  // console.log('App Hide')
})
</script>
<style lang="scss">
// 引入wot-ui的组件库样式
@use '@wot-ui/ui/styles/theme/index.scss' as *;

// 全局样式
page {
  background-color: $pageBg;
  font-size: 28rpx;
}
</style>
