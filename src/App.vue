<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()

// App 只恢复登录态，登录后去向统一交给登录页，避免覆盖分享卡片入口。
onLaunch(async () => {
  await userStore.initUserStore()
})

onShow(async () => {
  // onShow 会覆盖小程序从后台恢复的场景，不能只依赖 onLaunch。
  await userStore.initUserStore()
})

onHide(() => {})
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
