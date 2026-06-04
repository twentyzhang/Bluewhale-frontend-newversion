import request from './request';

export function listCouponGroups(params) {
  return request.get('/coupon-groups', { params });
}

export function claimCoupon(groupId) {
  return request.post(`/coupon-groups/${groupId}/claim`, {});
}

export function getMyCoupons(params) {
  return request.get('/coupons/mine', { params });
}

export function createGlobalCouponGroup(data) {
  return request.post('/coupon-groups', data);
}

export function deleteCouponGroup(groupId) {
  return request.delete(`/coupon-groups/${groupId}`);
}

export function createStoreCouponGroup(storeId, data) {
  return request.post(`/stores/${storeId}/coupon-groups`, data);
}
