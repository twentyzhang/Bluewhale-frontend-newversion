import request from './request';

export function listProductReviews(productId, params) {
  return request.get(`/products/${productId}/reviews`, { params });
}

export function createProductReview(productId, data) {
  return request.post(`/products/${productId}/reviews`, data);
}

export function createReviewReply(reviewId, data) {
  return request.post(`/reviews/${reviewId}/replies`, data);
}
