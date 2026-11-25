<template>
  <view :class="[props.id > 0 ? 'avatar-img' : 'avatar-icon', 'su-avatar']">
    <view v-if="props.id > 0" class="img">
      <SuImage :src="localSrc" />
    </view>
    <view v-else class="icon">
      <SuImage name="avatar.webp" />
    </view>
  </view>
</template>

<script lang="ts">
export default {
  name: 'SuAvatar' // 头像展示组件
}
</script>
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
// 全局属性
// api
import { getAttachmentListApi } from '@/api/common/attachment'
// ts
import type { UserAvatarResponse } from '@/api/modules/user/types'
// utils

// props属性
interface Props {
  id?: number // 头像id
  src?: string // 头像url地址
  expiresAt?: number | null // url地址有效期时间
  width?: string // 宽度
  height?: string // 高度
  // module?: string // 所属业务模块
}

const props = withDefaults(defineProps<Props>(), {
  id: 0,
  src: '',
  expiresAt: null,
  width: '100%',
  height: '100%'
  // module: ''
})

const localSrc = ref('')

const emit = defineEmits<{
  (event: 'refresh', avatar: UserAvatarResponse): void
}>()

const refreshBefore = 5 * 60 * 1000
let timer: ReturnType<typeof setTimeout> | undefined
// 清空刷新时间
const clearRefreshTimer = () => {
  if (timer !== undefined) {
    clearTimeout(timer)
    timer = undefined
  }
}

// 按接口返回的真实有效期，在到期前 5 分钟刷新，不按固定 12 小时推算。
const scheduleRefresh = (expiresAt: number | null) => {
  clearRefreshTimer()
  if (props.id <= 0) return
  const delay = typeof expiresAt === 'number' && Number.isFinite(expiresAt) ? Math.max(0, expiresAt - Date.now() - refreshBefore) : 0
  timer = setTimeout(() => {
    timer = undefined
    void refreshAvatar()
  }, delay)
}

// 刷新头像
const refreshAvatar = async () => {
  try {
    const list = await getAttachmentListApi({ idArr: [props.id] })
    const attachment = list.find((item) => item.id === props.id)
    if (!attachment?.url || typeof attachment.expiresAt !== 'number' || !Number.isFinite(attachment.expiresAt) || attachment.expiresAt <= Date.now() + refreshBefore) return

    localSrc.value = attachment.url
    emit('refresh', { avatarId: props.id, avatarUrl: attachment.url, urlExpiresAt: attachment.expiresAt })
    scheduleRefresh(attachment.expiresAt)
  } catch (error) {
    // 本阶段只实现正常续签，接口失败不自动重试。
    console.error('[SuAvatar] 刷新头像地址失败:', error)
  }
}

watch(
  () => [props.id, props.src, props.expiresAt] as const,
  () => {
    localSrc.value = props.src
    scheduleRefresh(props.expiresAt)
  },
  { immediate: true }
)

onBeforeUnmount(clearRefreshTimer)
</script>

<style lang="scss" scoped>
.su-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  overflow: hidden;
  .img {
    width: 100%;
    height: 100%;
  }
  .icon {
    width: 64rpx;
    height: 70rpx;
  }
}
.avatar-img {
  border: 2rpx solid $line;
}
.avatar-icon {
  background-color: $subBg;
}
</style>
