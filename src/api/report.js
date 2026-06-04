import request from './request';

export function getAdminOrderReport(params) {
  return request.get('/admin/reports/orders', { params });
}

export function getStoreOrderReport(storeId, params) {
  return request.get(`/stores/${storeId}/reports/orders`, { params });
}
