import request from '@/api/service';

/**
 * 获取用户列表
 * @returns 
 */
export const getUserListApi = () => {
  return request({
    url: '/api/user/getList',
    method: 'GET'
  });
};