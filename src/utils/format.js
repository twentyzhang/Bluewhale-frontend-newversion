import { formatCouponMinOrder } from './couponStatus';

export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `¥${Number(value).toFixed(2)}`;
}

export function formatRating(value) {
  if (value == null) return '暂无评分';
  return Number(value).toFixed(1);
}

export function formatCouponValue(coupon) {
  if (!coupon) return '';
  if (coupon.type === 'DISCOUNT') {
    return `${(Number(coupon.value) * 10).toFixed(1)}折`;
  }
  return `减${Number(coupon.value).toFixed(2)}元`;
}

export function formatCouponLabel(coupon) {
  if (!coupon) return '';
  const name = coupon.groupName || coupon.name || '优惠券';
  return `${name}（${formatCouponValue(coupon)}，${formatCouponMinOrder(coupon)}）`;
}

export function formatAddress(addr) {
  if (!addr) return '';
  return `${addr.province}${addr.city}${addr.district}${addr.detail}`;
}
