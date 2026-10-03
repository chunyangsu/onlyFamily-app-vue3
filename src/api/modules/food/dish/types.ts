
// 菜品表单
export interface DishForm {
  name: string // 名称
  categoryId: number // 分类id
  introduction: string // 介绍
  makeProcess: string // 制作过程
  price: string // 价格
}

// 菜品列表字段
export interface DishItem {
  id: number
  name: string // 名称
  price: string // 价格
  saleNum: number // 销量
  cartNum: number // 购物车数量(临时暂存)
}