export const COUPON_STATUS = {
  UNUSED: { label: '未使用', color: 'green' },
  USED: { label: '已使用', color: 'default' },
  EXPIRED: { label: '已过期', color: 'red' },
};

export const COUPON_TYPE = {
  DISCOUNT: { label: '折扣券' },
  FULL_REDUCTION: { label: '满减券' },
  DIRECT_OFF: { label: '直减券' },
};

export function getCouponStatusMeta(status) {
  return COUPON_STATUS[status] || { label: status, color: 'default' };
}

export function formatCouponType(type) {
  if (type === 'AMOUNT_OFF') return '满减券';
  return COUPON_TYPE[type]?.label || type || '优惠券';
}

export function formatCouponMinOrder(coupon) {
  if (!coupon) return '';
  if (coupon.type === 'DIRECT_OFF' || Number(coupon.minOrderAmount) === 0) {
    return '无门槛';
  }
  return `满 ${Number(coupon.minOrderAmount).toFixed(2)} 元可用`;
}

/** 同类型最多选 1 张，最多 3 张 */
export function canSelectCoupon(selectedCoupons, candidate) {
  if (selectedCoupons.some((c) => c.id === candidate.id)) {
    return { ok: true, reason: '' };
  }
  if (selectedCoupons.length >= 3) {
    return { ok: false, reason: '最多同时使用 3 张优惠券' };
  }
  const sameType = selectedCoupons.find((c) => c.type === candidate.type);
  if (sameType) {
    return { ok: false, reason: `同类型只能选 1 张（已选${formatCouponType(sameType.type)}）` };
  }
  return { ok: true, reason: '' };
}
