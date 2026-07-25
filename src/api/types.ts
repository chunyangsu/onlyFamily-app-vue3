// 后端统一返回的数据结构
export interface Response<T> {
  code: number;
  data: T;
  msg: string;
}