import request from '@/api/service'
import type { DishCategoryItem, DishForm } from '@/api/modules/food/types'

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
 * 新建菜品
 *
 * @param data
 */
export function createDishApi(data: DishForm) {
  return request({
    url: '/api/dish/create',
    method: 'POST',
    data: data
  })
}