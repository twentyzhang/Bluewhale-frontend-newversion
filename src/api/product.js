import request from './request';

export function searchProducts(params) {
  return request.get('/products', { params });
}

export function getProductDetail(productId) {
  return request.get(`/products/${productId}`);
}
