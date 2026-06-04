export const COUPON_STATUS = {
  UNUSED: { label: '未使用', color: 'green' },
  USED: { label: '已使用', color: 'default' },
  EXPIRED: { label: '已过期', color: 'red' },
};

export function getCouponStatusMeta(status) {
  return COUPON_STATUS[status] || { label: status, color: 'default' };
}

export function formatCouponType(type) {
  return type === 'DISCOUNT' ? '折扣券' : '满减券';
}
