import request from '@/api/service'
import type { DishForm } from '@/api/modules/food/dish/types'

/**
 * 获取菜品列表
 * @returns
 */
export const getDishListApi = () => {
  return request({
    url: '/api/dish/getList',
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
