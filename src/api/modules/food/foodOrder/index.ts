import request from '@/api/service'
import type { FoodOrderFormApi } from '@/api/modules/food/foodOrder/types'

/**
 * 获取菜品列表
 * @returns
 */
// export const getDishListApi = () => {
//   return request({
//     url: '/api/dish/getList',
//     method: 'GET'
//   })
// }

/**
 * 新建食物订单
 *
 * @param data
 */
export function createFoodOrderApi(data: FoodOrderFormApi) {
  return request({
    url: '/api/foodOrder/create',
    method: 'POST',
    data: data
  })
}
