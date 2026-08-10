import { defineStore } from 'pinia'
// api
import { loginApi } from '@/api/modules/user'
// ts
import type { LoginForm } from '@/api/modules/user/types'

interface UserInfo {
  id: number
  name: string
}

// uni-app 存储适配器（提取复用）
const uniStorage = {
  getItem: (key: string): string | null => uni.getStorageSync(key) || null,
  setItem: (key: string, value: string) => uni.setStorageSync(key, value),
  removeItem: (key: string) => uni.removeStorageSync(key)
}

export const useUserStore = defineStore(
  'user',
  () => {
    // token
    const token = ref('')
    // 用户信息
    const userInfo = ref<UserInfo>({
      id: 0,
      name: ''
    })

    // 登录
    const login = async (data: LoginForm) => {
      const response: any = await loginApi(data)

      // 更新缓存中的状态
      token.value = response.token
      userInfo.value = {
        id: response.id,
        name: response.name
      }
    }

    // 退出登录
    const logout = () => {
      //   token.value = '';
      //   userInfo.value = null;
      //   // 注意：如果配置了持久化，插件会自动同步清空本地存储
      //   // 如果想手动兜底，可以加上：uni.removeStorageSync('user');
    }

    return { token, userInfo, login }
  },
  {
    // 持久化配置（自动存入本地存储）
    persist: [
      {
        key: 'token',
        storage: uniStorage,
        paths: ['token']
      },
      {
        key: 'userInfo',
        storage: uniStorage,
        paths: ['userInfo']
      }
    ]
  }
)
