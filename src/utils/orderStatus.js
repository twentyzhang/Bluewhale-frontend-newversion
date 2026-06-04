export const ORDER_STATUS = {
  PENDING_PAYMENT: { label: '待付款', color: 'orange' },
  PAID: { label: '待发货', color: 'blue' },
  SHIPPED: { label: '待收货', color: 'cyan' },
  COMPLETED: { label: '已完成', color: 'green' },
  CANCELLED: { label: '已取消', color: 'default' },
};

export const ORDER_STATUS_TABS = [
  { key: '', label: '全部' },
  { key: 'PENDING_PAYMENT', label: '待付款' },
  { key: 'PAID', label: '待发货' },
  { key: 'SHIPPED', label: '待收货' },
  { key: 'COMPLETED', label: '已完成' },
  { key: 'CANCELLED', label: '已取消' },
];

export function getOrderStatusMeta(status) {
  return ORDER_STATUS[status] || { label: status, color: 'default' };
}
