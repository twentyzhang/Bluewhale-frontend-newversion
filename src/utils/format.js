export function formatPrice(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `¥${Number(value).toFixed(2)}`;
}

export function formatRating(value) {
  if (value == null) return '暂无评分';
  return Number(value).toFixed(1);
}

export function formatCouponLabel(coupon) {
  if (!coupon) return '';
  if (coupon.type === 'DISCOUNT') {
    return `${coupon.groupName}（${(Number(coupon.value) * 10).toFixed(1)}折，满${Number(coupon.minOrderAmount).toFixed(2)}元可用）`;
  }
  return `${coupon.groupName}（减${Number(coupon.value).toFixed(2)}元，满${Number(coupon.minOrderAmount).toFixed(2)}元可用）`;
}

export function formatAddress(addr) {
  if (!addr) return '';
  return `${addr.province}${addr.city}${addr.district}${addr.detail}`;
}
