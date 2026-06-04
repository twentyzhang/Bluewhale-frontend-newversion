import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import {
  cancelOrder,
  confirmOrder,
  getOrderDetail,
  payOrder,
  refundOrder,
} from '../../api/order';
import { formatPrice } from '../../utils/format';
import { getOrderStatusMeta } from '../../utils/orderStatus';

const { Title, Text } = Typography;

function OrderDetail() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [order, setOrder] = useState(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOrderDetail(orderId);
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const runAction = async (action, successMsg) => {
    setActing(true);
    try {
      await action();
      message.success(successMsg);
      await loadOrder();
    } catch {
      // 错误已提示
    } finally {
      setActing(false);
    }
  };

  const handlePay = () =>
    runAction(() => payOrder(orderId), '支付成功');

  const handleCancel = () =>
    runAction(() => cancelOrder(orderId), '订单已取消');

  const handleConfirm = () =>
    runAction(() => confirmOrder(orderId), '已确认收货');

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      message.warning('请填写退款原因');
      return;
    }
    setActing(true);
    try {
      await refundOrder(orderId, { reason: refundReason.trim() });
      message.success('退款申请已提交');
      setRefundOpen(false);
      setRefundReason('');
      await loadOrder();
    } catch {
      // 错误已提示
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return <Empty description="订单不存在" />;
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const addr = order.address;

  const itemColumns = [
    {
      title: '商品',
      dataIndex: 'productName',
      render: (name, record) => (
        <Space>
          <Link to={`/products/${record.productId}`}>{name}</Link>
          {order.status === 'COMPLETED' && (
            <Link to={`/products/${record.productId}?review=1`}>评价</Link>
          )}
        </Space>
      ),
    },
    { title: '单价', dataIndex: 'price', render: formatPrice },
    { title: '数量', dataIndex: 'quantity' },
    { title: '小计', dataIndex: 'subtotal', render: formatPrice },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: <Link to="/orders">我的订单</Link> },
          { title: `订单 ${order.id}` },
        ]}
      />
      <Card
        title={
          <Space>
            <span>订单详情</span>
            <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {order.status === 'PENDING_PAYMENT' && (
              <>
                <Button type="primary" loading={acting} onClick={handlePay}>
                  立即支付
                </Button>
                <Popconfirm title="确定取消订单？" onConfirm={handleCancel}>
                  <Button loading={acting}>取消订单</Button>
                </Popconfirm>
              </>
            )}
            {order.status === 'PAID' && (
              <Popconfirm title="确定取消并退款？" onConfirm={handleCancel}>
                <Button loading={acting}>取消订单</Button>
              </Popconfirm>
            )}
            {order.status === 'SHIPPED' && (
              <Popconfirm title="确认已收到商品？" onConfirm={handleConfirm}>
                <Button type="primary" loading={acting}>
                  确认收货
                </Button>
              </Popconfirm>
            )}
            {order.status === 'COMPLETED' && (
              <Button loading={acting} onClick={() => setRefundOpen(true)}>
                申请退款
              </Button>
            )}
          </Space>
        }
      >
        <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="订单号">{order.id}</Descriptions.Item>
          <Descriptions.Item label="下单时间">
            {order.createdAt?.replace('T', ' ')}
          </Descriptions.Item>
          <Descriptions.Item label="商品总额">{formatPrice(order.totalAmount)}</Descriptions.Item>
          <Descriptions.Item label="优惠">{formatPrice(order.discountAmount)}</Descriptions.Item>
          <Descriptions.Item label="应付金额">
            <Text strong style={{ color: '#c41d7f' }}>
              {formatPrice(order.payableAmount)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="支付时间">
            {order.paidAt?.replace('T', ' ') || '—'}
          </Descriptions.Item>
          <Descriptions.Item label="收货人" span={2}>
            {addr
              ? `${addr.receiverName} ${addr.phone} · ${addr.province}${addr.city}${addr.district}${addr.detail}`
              : '—'}
          </Descriptions.Item>
        </Descriptions>
        <Title level={5}>商品明细</Title>
        <Table
          rowKey="productId"
          columns={itemColumns}
          dataSource={order.items || []}
          pagination={false}
          size="small"
        />
      </Card>
      <Modal
        title="申请退款"
        open={refundOpen}
        onCancel={() => setRefundOpen(false)}
        onOk={handleRefund}
        confirmLoading={acting}
      >
        <Input.TextArea
          rows={4}
          placeholder="请填写退款原因"
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default OrderDetail;
