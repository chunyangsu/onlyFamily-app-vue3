import request from '@/api/service'
import type { DishQuery, DishItem, DishGroupQuery, DishGroupItem, DishForm } from '@/api/modules/food/dish/types'

/**
 * 获取菜品列表
 * @returns
 */
export const getDishListApi = (query: DishQuery): Promise<$PageResult<DishItem[]>> => {
  return request<$PageResult<DishItem[]>>({
    url: '/api/dish/getList',
    method: 'GET',
    data: query
  })
}

/**
 * 获取菜品列表(按菜品分类分组)
 * @returns
 */
export const getDishGroupListApi = (query: DishGroupQuery): Promise<$PageResult<DishGroupItem[]>> => {
  return request<$PageResult<DishGroupItem[]>>({
    url: '/api/dish/getList/byGroup',
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
