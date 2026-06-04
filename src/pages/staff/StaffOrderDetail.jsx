import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Empty,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { getOrderDetail, shipOrder } from '../../api/order';
import ShipFormModal from '../../components/ShipFormModal';
import StaffStoreGuard from '../../components/StaffStoreGuard';
import { useStaffStoreId } from '../../hooks/useStaffStore';
import { formatPrice } from '../../utils/format';
import { getOrderStatusMeta } from '../../utils/orderStatus';

const { Title, Text } = Typography;

function StaffOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const storeId = useStaffStoreId();
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [order, setOrder] = useState(null);
  const [shipOpen, setShipOpen] = useState(false);

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

  const handleShip = async (values) => {
    setActing(true);
    try {
      await shipOrder(storeId, orderId, values);
      message.success('发货成功');
      setShipOpen(false);
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
    return <Empty description="订单不存在或无权查看" />;
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const addr = order.address;

  const itemColumns = [
    { title: '商品', dataIndex: 'productName' },
    { title: '单价', dataIndex: 'price', render: formatPrice },
    { title: '数量', dataIndex: 'quantity' },
    { title: '小计', dataIndex: 'subtotal', render: formatPrice },
  ];

  return (
    <StaffStoreGuard>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/staff"><HomeOutlined /> 工作台</Link> },
          { title: <Link to="/staff/orders">门店订单</Link> },
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
          order.status === 'PAID' ? (
            <Button type="primary" onClick={() => setShipOpen(true)}>
              发货
            </Button>
          ) : null
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
              ? `${addr.receiverName} ${addr.phone} · ${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.detail || ''}`
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
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => navigate('/staff/orders')}>返回列表</Button>
        </div>
      </Card>
      <ShipFormModal
        open={shipOpen}
        confirmLoading={acting}
        onCancel={() => setShipOpen(false)}
        onSubmit={handleShip}
      />
    </StaffStoreGuard>
  );
}

export default StaffOrderDetail;
