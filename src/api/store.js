import request from './request';

export function listStores(params) {
  return request.get('/stores', { params });
}

export function listAdminStores(params) {
  return request.get('/admin/stores', { params });
}

export function createStore(data) {
  return request.post('/stores', data);
}

export function updateStore(storeId, data) {
  return request.put(`/stores/${storeId}`, data);
}

export function getStoreDetail(storeId) {
  return request.get(`/stores/${storeId}`);
}

export function listStoreProducts(storeId, params) {
  return request.get(`/stores/${storeId}/products`, { params });
}
