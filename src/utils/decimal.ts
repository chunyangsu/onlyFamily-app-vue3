import Decimal from 'decimal.js'

// 创建独立 Decimal 实例，避免修改 Decimal.js 全局配置
const D = Decimal.clone({
  precision: 50,
  rounding: Decimal.ROUND_HALF_UP
})

type Operator = '+' | '-' | '*' | '/'

/**
 * 将数学表达式拆分为 Token
 */
const tokenize = (expression: string): string[] => {
  const tokens: string[] = []
  let index = 0

  while (index < expression.length) {
    const char = expression[index]

    // 忽略空格
    if (/\s/.test(char)) {
      index++
      continue
    }

    // 运算符和括号
    if ('+-*/()'.includes(char)) {
      tokens.push(char)
      index++
      continue
    }

    // 数字，支持整数、小数以及 .5、5.
    if (/[0-9.]/.test(char)) {
      const start = index

      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        index++
      }

      const value = expression.slice(start, index)

      // 检查数字格式
      if (!/^(?:\d+\.?\d*|\.\d+)$/.test(value)) {
        throw new Error(`无效的数字：${value}`)
      }

      tokens.push(value)
      continue
    }

    throw new Error(`不支持的字符：${char}`)
  }

  return tokens
}

/**
 * 数学表达式解析器
 * 使用递归下降算法处理运算优先级和括号
 */
const evaluate = (expression: string): Decimal => {
  const tokens = tokenize(expression)
  let index = 0

  /**
   * 解析基础表达式：数字、括号、一元正负号
   */
  const parsePrimary = (): Decimal => {
    const token = tokens[index]

    if (token === '+') {
      index++
      return parsePrimary()
    }

    if (token === '-') {
      index++
      return parsePrimary().negated()
    }

    if (token === '(') {
      index++

      const result = parseExpression()

      if (tokens[index] !== ')') {
        throw new Error('表达式括号不匹配')
      }

      index++
      return result
    }

    if (!token || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
      throw new Error(`无效的表达式：${token ?? '表达式结束'}`)
    }

    index++
    return new D(token)
  }

  /**
   * 解析乘法和除法
   */
  const parseTerm = (): Decimal => {
    let result = parsePrimary()

    while (tokens[index] === '*' || tokens[index] === '/') {
      const operator = tokens[index] as Operator
      index++

      const right = parsePrimary()

      if (operator === '*') {
        result = result.times(right)
      } else {
        if (right.isZero()) {
          throw new Error('除数不能为零')
        }

        result = result.dividedBy(right)
      }
    }

    return result
  }

  /**
   * 解析加法和减法
   */
  const parseExpression = (): Decimal => {
    let result = parseTerm()

    while (tokens[index] === '+' || tokens[index] === '-') {
      const operator = tokens[index] as Operator
      index++

      const right = parseTerm()

      if (operator === '+') {
        result = result.plus(right)
      } else {
        result = result.minus(right)
      }
    }

    return result
  }

  if (!tokens.length) {
    throw new Error('计算表达式不能为空')
  }

  const result = parseExpression()

  // 检查是否存在未解析的字符
  if (index !== tokens.length) {
    throw new Error(`无效的表达式：${tokens[index]}`)
  }

  return result
}

/**
 * 高精度数学表达式计算
 *
 * @param expression 数学表达式
 * @param precision 最终结果保留的小数位数，默认 2
 * @returns 格式化后的数字字符串
 */
export const decimal = (expression: string, precision = 2): string => {
  if (!Number.isInteger(precision) || precision < 0 || precision > 100) {
    throw new Error('小数精度必须是 0 到 100 之间的整数')
  }

  const result = evaluate(expression)

  return result.toFixed(precision, D.ROUND_HALF_UP)
}
