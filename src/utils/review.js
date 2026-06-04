import { getMyOrders, getOrderDetail } from '../api/order';

export async function fetchReviewEligibleOrders(productId) {
  const data = await getMyOrders({ status: 'COMPLETED', page: 1, size: 50 });
  const orders = data.records || [];
  if (!orders.length) return [];

  const details = await Promise.all(
    orders.map((order) => getOrderDetail(order.id).catch(() => null)),
  );

  return details.filter(
    (order) =>
      order?.items?.some((item) => String(item.productId) === String(productId)),
  );
}

export function hasUserReviewed(reviews, userId) {
  if (!userId || !reviews?.length) return false;
  return reviews.some((review) => String(review.userId) === String(userId));
}
