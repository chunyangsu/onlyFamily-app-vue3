export interface DishQuery {
  name: string // 菜品名称
  categoryIds: string // 所属分类
}

export interface DishGroupResponse {
  list: DishGroupItem[]
  total: number
}

// 菜品分组列表字段
export interface DishGroupItem {
  categoryId: number
  categoryName: string
  dishList: DishItem[]
}
// 菜品列表字段
export interface DishItem {
  id: number
  name: string // 名称
  mainImageId: number // 菜品主图id
  mainImageUrl: string // 菜品主图url地址
  price: string // 价格
  saleNum: number // 销量
  cartNum: number // 购物车数量(临时暂存)
}

// 菜品表单
export interface DishForm {
  name: string // 名称
  mainImageId: number // 菜品主图id
  categoryId: number // 分类id
  introduction: string // 介绍
  makeProcess: string // 制作过程
  price: string // 价格
}
