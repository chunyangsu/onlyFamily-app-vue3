<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/useUserStore'

const userStore = useUserStore()

// 重定向：跳转首页
const redirectToHome = () => {
  if (!userStore.token) return

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  // 登录页是pages.json中的首个页面，只有当前仍在登录页时才需要重定向
  if (currentPage?.route !== 'pages/login/index') return

  uni.reLaunch({
    url: '/pages/home/index',
    fail: (error) => {
      console.error('[App] 跳转首页失败:', error)
    }
  })
}

onLaunch(async () => {
  await userStore.initUserStore()
  redirectToHome()
})

onShow(async () => {
  // onShow 会覆盖小程序从后台恢复的场景，不能只依赖 onLaunch。
  await userStore.initUserStore()
  redirectToHome()
})

onHide(() => { })
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
