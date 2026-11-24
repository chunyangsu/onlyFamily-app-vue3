import request from '@/api/service'
import type { FoodOrderFormApi, FoodOrderItem } from '@/api/modules/food/foodOrder/types'

/**
 * 获取食物订单列表
 * @returns
 */
export const getFoodOrderListApi = (): Promise<FoodOrderItem[]> => {
  return request<FoodOrderItem[]>({
    url: '/api/foodOrder/getList',
    method: 'GET'
  })
}

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

/**
 * 获取食物订单详情
 * @returns
 */
export const getFoodOrderDetailApi = (id: number): Promise<FoodOrderItem> => {
  return request<FoodOrderItem>({
    url: '/api/foodOrder/getDetail/' + id,
    method: 'GET'
  })
}
