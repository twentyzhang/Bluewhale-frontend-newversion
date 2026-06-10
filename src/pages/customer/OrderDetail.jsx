import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  PayCircleOutlined,
  CheckCircleOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import {
  cancelOrder,
  confirmOrder,
  getOrderDetail,
  payOrder,
  refundOrder,
} from '../../api/order';
import { formatPrice } from '../../utils/format';
import { getOrderStatusMeta } from '../../utils/orderStatus';
import '../../styles/browse.css';

const { Title, Text, Paragraph } = Typography;

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

  const handlePay = () => runAction(() => payOrder(orderId), '支付成功');
  const handleCancel = () => runAction(() => cancelOrder(orderId), '订单已取消');
  const handleConfirm = () => runAction(() => confirmOrder(orderId), '已确认收货');

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
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return <Empty description="订单不存在" style={{ padding: '80px 0' }} />;
  }

  const statusMeta = getOrderStatusMeta(order.status);
  const addr = order.address;

  return (
    <div>
      {/* Hero 标题 */}
      <div className="page-hero" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} className="page-hero-title" style={{ margin: 0 }}>
              订单 #{order.id}
            </Title>
            <Space size={12} style={{ marginTop: 10 }}>
              <Tag
                color={statusMeta.color}
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  padding: '6px 18px',
                  borderRadius: 8,
                }}
              >
                {statusMeta.label}
              </Tag>
              <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14 }}>
                下单时间：{order.createdAt?.replace('T', ' ')}
              </Text>
            </Space>
          </div>
          <Link to="/orders">
            <Button
              size="large"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                color: '#fff',
                fontWeight: 600,
                borderRadius: 10,
              }}
            >
              <ArrowLeftOutlined /> 返回订单列表
            </Button>
          </Link>
        </div>
      </div>

      {/* 操作按钮 */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        {order.status === 'PENDING_PAYMENT' && (
          <>
            <Button
              type="primary"
              size="large"
              className="primary-gradient-btn"
              loading={acting}
              onClick={handlePay}
            >
              <PayCircleOutlined /> 立即支付
            </Button>
            <Popconfirm
              title="确定取消订单？"
              okText="确认"
              cancelText="取消"
              okButtonProps={{
                style: {
                  background: 'linear-gradient(135deg, #6a005f, #9b4d94)',
                  border: 'none',
                },
              }}
              onConfirm={handleCancel}
            >
              <Button size="large" danger loading={acting}>
                取消订单
              </Button>
            </Popconfirm>
          </>
        )}
        {order.status === 'PAID' && (
          <Popconfirm
            title="确定取消并退款？"
            okText="确认"
            cancelText="取消"
            okButtonProps={{
              style: {
                background: 'linear-gradient(135deg, #6a005f, #9b4d94)',
                border: 'none',
              },
            }}
            onConfirm={handleCancel}
          >
            <Button size="large" danger loading={acting}>
              取消订单
            </Button>
          </Popconfirm>
        )}
        {order.status === 'SHIPPED' && (
          <Popconfirm
            title="确认已收到商品？"
            okText="确认收货"
            cancelText="取消"
            okButtonProps={{
              style: {
                background: 'linear-gradient(135deg, #c9a227, #d4b106)',
                border: 'none',
              },
            }}
            onConfirm={handleConfirm}
          >
            <Button
              type="primary"
              size="large"
              className="primary-gradient-btn"
              loading={acting}
              style={{
                background: 'linear-gradient(135deg, #c9a227, #d4b106) !important',
              }}
            >
              <CheckCircleOutlined /> 确认收货
            </Button>
          </Popconfirm>
        )}
        {order.status === 'COMPLETED' && (
          <Button
            size="large"
            className="ghost-secondary-btn"
            loading={acting}
            onClick={() => setRefundOpen(true)}
          >
            <GiftOutlined /> 申请退款
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* 左侧订单信息 */}
        <div style={{ display: 'grid', gap: 16 }}>
          {/* 订单基本信息 */}
          <Card
            className="checkout-section-card"
            styles={{
              header: { borderBottom: '2px solid rgba(106,0,95,0.08)', paddingBottom: 12 },
              body: { padding: '20px 0 0' },
            }}
            title={
              <Space size={8}>
                <span style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>订单信息</span>
              </Space>
            }
          >
            <Descriptions
              column={2}
              size="small"
              labelStyle={{ color: '#8c8c8c', padding: '10px 12px', background: 'rgba(106,0,95,0.03)', fontWeight: 500 }}
              contentStyle={{ color: '#1f1f1f', padding: '10px 12px' }}
              bordered
              style={{ background: '#fff' }}
            >
              <Descriptions.Item label="订单号">{order.id}</Descriptions.Item>
              <Descriptions.Item label="下单时间">
                {order.createdAt?.replace('T', ' ')}
              </Descriptions.Item>
              <Descriptions.Item label="商品总额">
                <Text strong style={{ color: '#6a005f' }}>{formatPrice(order.totalAmount)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="优惠金额">
                {Number(order.discountAmount || 0) > 0 ? (
                  <Text strong style={{ color: '#52c41a' }}>
                    -{formatPrice(order.discountAmount)}
                  </Text>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="应付金额">
                <Text strong style={{ color: '#c9a227', fontSize: 16 }}>
                  {formatPrice(order.payableAmount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="支付时间">
                {order.paidAt?.replace('T', ' ') || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="收货人" span={2}>
                {addr ? (
                  <Text>
                    <Text strong>{addr.receiverName}</Text>
                    <Text type="secondary" style={{ marginLeft: 12 }}>
                      {addr.phone}
                    </Text>
                    <div style={{ marginTop: 4, color: '#595959' }}>
                      {addr.province} {addr.city} {addr.district} {addr.detail}
                    </div>
                  </Text>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 商品明细 */}
          <Card
            className="checkout-section-card"
            styles={{
              header: { borderBottom: '2px solid rgba(106,0,95,0.08)', paddingBottom: 12 },
              body: { padding: '20px 0 0' },
            }}
            title={
              <Space size={8}>
                <span style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>商品明细</span>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  （共 {order.items?.length || 0} 件）
                </Text>
              </Space>
            }
          >
            <div style={{ display: 'grid', gap: 12 }}>
              {(order.items || []).map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 14,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(106,0,95,0.02), rgba(212,177,6,0.02))',
                    border: '1px solid rgba(106,0,95,0.06)',
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #f5f0f7, #fff8e6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9b4d94',
                      flexShrink: 0,
                      fontSize: 12,
                    }}
                  >
                    商品图
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/products/${item.productId}`} style={{ color: '#1f1f1f', fontWeight: 600, fontSize: 15 }}>
                      {item.productName}
                    </Link>
                    <div style={{ marginTop: 6, fontSize: 13, color: '#595959' }}>
                      单价：{formatPrice(item.price)} × <Text strong style={{ color: '#6a005f' }}>{item.quantity}</Text>
                    </div>
                    {order.status === 'COMPLETED' && (
                      <div style={{ marginTop: 8 }}>
                        <Link
                          to={`/products/${item.productId}?review=1`}
                          style={{
                            color: '#c9a227',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          发表评价 →
                        </Link>
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#c9a227', fontWeight: 700, fontSize: 17 }}>
                      {formatPrice(Number(item.price) * Number(item.quantity))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 右侧金额汇总 */}
        <div style={{ position: 'sticky', top: 24 }}>
          <Card
            styles={{
              header: { borderBottom: '2px solid rgba(106,0,95,0.08)', paddingBottom: 12 },
              body: { padding: '20px 0 0' },
            }}
            style={{
              borderRadius: 16,
              background: 'linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #6a005f, #d4b106) border-box',
              border: '2px solid transparent',
              boxShadow: '0 8px 24px rgba(106,0,95,0.1)',
            }}
            title={
              <span style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>金额汇总</span>
            }
          >
            <div style={{ padding: '0 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed rgba(106,0,95,0.08)' }}>
                <Text style={{ color: '#595959' }}>商品总额</Text>
                <Text strong>{formatPrice(order.totalAmount)}</Text>
              </div>
              {Number(order.discountAmount || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed rgba(106,0,95,0.08)' }}>
                  <Text style={{ color: '#595959' }}>优惠减免</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    -{formatPrice(order.discountAmount)}
                  </Text>
                </div>
              )}
              <div style={{ padding: '20px 0 8px', textAlign: 'center' }}>
                <Text style={{ color: '#6a005f', fontSize: 13, fontWeight: 600 }}>应付金额</Text>
                <div style={{ lineHeight: 1.1, marginTop: 8 }}>
                  <span style={{ color: '#d4b106', fontSize: 20, fontWeight: 700 }}>¥</span>
                  <span style={{ color: '#c9a227', fontSize: 40, fontWeight: 800, letterSpacing: 1, marginLeft: 4 }}>
                    {Number(order.payableAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        title={
          <span style={{ color: '#6a005f', fontWeight: 700 }}>申请退款</span>
        }
        open={refundOpen}
        onCancel={() => setRefundOpen(false)}
        onOk={handleRefund}
        confirmLoading={acting}
        okText="提交申请"
        cancelText="取消"
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #6a005f, #9b4d94)',
            border: 'none',
            height: 40,
            padding: '0 24px',
            fontWeight: 600,
          },
        }}
      >
        <Paragraph style={{ color: '#595959', marginBottom: 16 }}>
          请填写退款原因，我们会尽快为您处理。
        </Paragraph>
        <textarea
          rows={4}
          placeholder="请填写退款原因..."
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
          style={{
            width: '100%',
            borderRadius: 8,
            border: '1.5px solid rgba(106,0,95,0.15)',
            padding: '10px 12px',
            fontSize: 14,
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#9b4d94';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(106,0,95,0.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(106,0,95,0.15)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </Modal>
    </div>
  );
}

export default OrderDetail;
