<template>
  <view class="content">
    <view class="text-area m-b-50rpx">
      <text class="title">11{{ title }}</text>
    </view>
    <wd-button type="success" @click="getUserList">成功按钮111</wd-button>
    <wd-icon name="add-circle" />
  </view>
</template>

<script setup lang="ts">
import { getUserListApi } from '@/api/modules/user';

const title = ref('Hello scy')

const getUserList = async () => {
  getUserListApi().then(res => {
    console.log(res)
  })
}
</script>

<style lang="scss">
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;

  .title {
    font-size: 36rpx;
    color: #8f8f94;
  }
}
</style>
