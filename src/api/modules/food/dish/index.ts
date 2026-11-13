import request from '@/api/service'
import type { DishQuery, DishGroupResponse, DishForm } from '@/api/modules/food/dish/types'

/**
 * 获取菜品列表
 * @returns
 */
export const getDishListApi = (query: DishQuery): Promise<DishGroupResponse> => {
  return request<DishGroupResponse>({
    url: '/api/dish/getList',
    method: 'GET',
    data: query
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
