// 食物订单表单
export interface FoodOrderFormApi {
  dishArr: FoodOrderDishItemApi[]
  remark: string // 备注
}

// 食物订单菜品项
export interface FoodOrderDishItemApi {
  id: number // 菜品id
  num: number // 数量
}

// 食物订单列表字段
export interface FoodOrderItemApi {
  id: number
  // name: string // 名称
  // price: string // 价格
  // saleNum: number // 销量
  // cartNum: number // 购物车数量(临时暂存)
}
