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
export interface FoodOrderItem {
  id: number // 订单id
  code: string // 订单编号
  progress: string // 订单进度
  remark: string // 订单备注
  dishArr: DishItem[]
  createUser: CreateUser // 创建人信息
  createTime: string // 创建时间
}

export interface CreateUser {
  id: number
  nickname: string
  avatarId: number
  avatarUrl: string
}

export interface DishItem {
  id: number // 菜品id
  name: string // 菜品名称
  mainImageUrl: string // 菜品主图
  price: string // 价格
  num: number // 数量
}
