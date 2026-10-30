/**
 * 金额格式化(千分位处理)
 */
export const moneyFormat = (value: number) => {
  // 将数字转换为字符串
  const tempStr = value.toString()
  // 分割小数和整数部分
  const parts = tempStr.split('.')
  let integerPart = parts[0]
  const decimalPart = parts[1] ? '.' + parts[1] : ''
  // 整数部分每三位添加逗号
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  // 将整数和小数部分重新组合并返回
  return integerPart + decimalPart
}
