<template>
  <view class="content">
    <view class="text-area">
      <text class="title">LOGO</text>
    </view>
    <view>
      <wd-form ref="formRef" :model="formData" :schema="schema" :title-width="100">
        <wd-form-item prop="mobile">
          <wd-input type="number" v-model="formData.mobile" placeholder="手机号" />
        </wd-form-item>

        <wd-form-item prop="password">
          <wd-input type="text" v-model="formData.password" placeholder="密码" show-password />
        </wd-form-item>
        <view class="footer">
          <wd-button type="primary" size="large" @click="submitData" block>登录</wd-button>
        </view>
      </wd-form>
    </view>
    <!-- <wd-button type="success">手机号一键登录</wd-button> -->
  </view>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { zodAdapter } from '@wot-ui/ui'
// 全局属性
// api
import { loginApi } from '@/api/modules/user'
// ts
import type { LoginForm } from '@/api/modules/user/types'

const formRef = ref()
// 表单数据
const formData = ref<LoginForm>({
  mobile: '',
  password: ''
})

// 表单校验
const schema = zodAdapter(
  z.object({
    mobile: z
      .string()
      .min(1, '手机号不能为空')
      .regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
    password: z.string().min(6, '密码不能少于6位')
  })
  // .superRefine((data, ctx) => {
  //   if (data.value1 === data.value2) return
  //   const message = '两个输入框的内容必须一致'
  //   ctx.addIssue({ code: 'custom', message, path: ['value1'] })
  //   ctx.addIssue({ code: 'custom', message, path: ['value2'] })
  // })
)

// 提交
const submitData = async () => {
  try {
    // 表单校验
    const { valid } = await formRef.value?.validate()
    if (!valid) return
    // loading.value = true
    const response: any = await loginApi(formData.value)
    // 保存 Token
    uni.setStorageSync('token', response.token)
    uni.showToast({ title: '登录成功', icon: 'success' })

    setTimeout(() => {
      // 跳转首页
      uni.switchTab({ url: '/pages/home/index' })
    }, 1000)
  } catch (err) {
    // 接口请求失败
    console.error(err)
  } finally {
    // loading.value = false
  }
}
</script>

<style lang="scss" scoped>
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
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
