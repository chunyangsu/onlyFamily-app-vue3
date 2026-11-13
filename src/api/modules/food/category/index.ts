import request from '@/api/service'
import type { DishCategoryForm } from '@/api/modules/food/category/types'

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

/**
 * 新建菜品分类
 *
 * @param data
 */
export function createDishCategoryApi(data: DishCategoryForm) {
  return request({
    url: '/api/dishCategory/create',
    method: 'POST',
    data: data
  })
}