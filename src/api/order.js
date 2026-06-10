import request from './request';

export function createOrder(data) {
  return request.post('/orders', data);
}

export function previewOrderCoupons(data) {
  return request.post('/orders/coupon-preview', data);
}

export function getMyOrders(params) {
  return request.get('/orders', { params });
}

export function getOrderDetail(orderId) {
  return request.get(`/orders/${orderId}`);
}

export function payOrder(orderId) {
  return request.post(`/orders/${orderId}/pay`, {});
}

export function cancelOrder(orderId) {
  return request.post(`/orders/${orderId}/cancel`, {});
}

export function confirmOrder(orderId) {
  return request.post(`/orders/${orderId}/confirm`, {});
}

export function refundOrder(orderId, data) {
  return request.post(`/orders/${orderId}/refund`, data);
}

export function listStoreOrders(storeId, params) {
  return request.get(`/stores/${storeId}/orders`, { params });
}

export function shipOrder(storeId, orderId, data) {
  return request.post(`/stores/${storeId}/orders/${orderId}/ship`, data);
}
