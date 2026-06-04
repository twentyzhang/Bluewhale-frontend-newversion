import request from './request';

export function createOrder(data) {
  return request.post('/orders', data);
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
