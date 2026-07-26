import type { Response } from './types'

// 获取后端地址的基础路径
const baseUrl = import.meta.env.VITE_APP_BASE_API

/**
 * 接口请求
 * @param options
 * @returns Promise
 */
const request = <T>(options: UniApp.RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    // 获取本地存储的 token
    const token = uni.getStorageSync('token')

    // 发起请求
    uni.request({
      ...options,
      // 后端url地址
      url: `${baseUrl}${options.url}`,
      // 请求头
      header: {
        'Content-Type': 'application/json;charset=UTF-8',
        ...options.header,
        // 身份认证：如果存在 token，则自动添加到请求头
        Authorization: token ? `Bearer ${token}` : ''
      },
      // 请求成功
      success: (response) => {
        const { statusCode, data } = response
        // 后端统一返回格式为：{ code: 0, data: any, msg: string }

        // HTTP状态码判断
        if (statusCode === 200) {
          // http成功
          const result = data as Response<T>
          if (result.code === 0) {
            resolve(result.data)
          } else {
            // 业务逻辑报错处理
            if (result.code === 10107) {
              // 手机号或密码错误
              uni.showToast({ title: result.msg, icon: 'none' })
            } else {
              uni.showToast({ title: result.msg || '系统异常，请稍后重试', icon: 'none' })
            }
            reject(result)
          }
        } else {
          // http错误
        }
      },
      // 请求失败
      fail: (error) => {
        // 网络异常或请求超时处理
        uni.showToast({ title: '网络请求失败，请检查后端服务', icon: 'none' })
        reject(error)
      }
    })
  })
}

export default request
