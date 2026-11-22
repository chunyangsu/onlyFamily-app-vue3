/**
 * 请求头配置
 */
interface $HeaderConfig {
  permCode?: string // 权限标识
}

/**
 * 分页查询参数
 */
interface $PageQuery {
  page: number
  limit: number
}

/**
 * 分页响应对象
 */
interface $PageResult<T> {
  list: T // 数据列表
  total: number // 数据总数
}
