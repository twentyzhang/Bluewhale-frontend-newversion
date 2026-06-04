import request from './request';

export function searchProducts(params) {
  return request.get('/products', { params });
}

export function getProductDetail(productId) {
  return request.get(`/products/${productId}`);
}

export function createStoreProduct(storeId, data) {
  return request.post(`/stores/${storeId}/products`, data);
}

export function updateStoreProduct(storeId, productId, data) {
  return request.put(`/stores/${storeId}/products/${productId}`, data);
}

export function deleteStoreProduct(storeId, productId) {
  return request.delete(`/stores/${storeId}/products/${productId}`);
}

export function updateStoreProductStock(storeId, productId, data) {
  return request.put(`/stores/${storeId}/products/${productId}/stock`, data);
}
