import request from './request';

export function listStores(params) {
  return request.get('/stores', { params });
}

export function getStoreDetail(storeId) {
  return request.get(`/stores/${storeId}`);
}

export function listStoreProducts(storeId, params) {
  return request.get(`/stores/${storeId}/products`, { params });
}
