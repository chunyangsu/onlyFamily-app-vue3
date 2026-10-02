// 菜品分类列表字段
export interface DishCategoryItem {
  value: string
  label: string // 分类名称
}

// 菜品表单
export interface DishForm {
  name: string // 名称
  categoryId: number // 分类id
  introduction: string // 介绍
  makeProcess: string // 制作过程
  price: string // 价格
}
