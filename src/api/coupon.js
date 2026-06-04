import request from './request';

export function getMyCoupons(params) {
  return request.get('/coupons/mine', { params });
}
