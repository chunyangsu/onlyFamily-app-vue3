import request from '@/api/service'

/**
 * 获取菜品分类列表
 * @returns
 */
export const getDishCategoryListApi = () => {
  return request({
    url: '/api/dishCategory/getList',
    method: 'GET'
  })
}