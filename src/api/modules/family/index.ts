import request from '@/api/service'
import type { FamilyForm } from '@/api/modules/family/types'

/**
 * 获取菜品列表
 * @returns
 */
// export const getFamilyListApi = () => {
//   return request({
//     url: '/api/family/getList',
//     method: 'GET'
//   })
// }

/**
 * 新建家庭
 *
 * @param data
 */
export function createFamilyApi(data: FamilyForm) {
  return request({
    url: '/api/family/create',
    method: 'POST',
    data: data
  })
}
