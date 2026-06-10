import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Pagination,
  Popconfirm,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ShoppingOutlined,
  EyeOutlined,
  PayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { cancelOrder, confirmOrder, getMyOrders, payOrder } from '../../api/order';
import { formatPrice } from '../../utils/format';
import { getOrderStatusMeta, ORDER_STATUS_TABS } from '../../utils/orderStatus';
import '../../styles/browse.css';

const { Title, Text } = Typography;

function OrderList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';

  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const loadOrders = useCallback(
    async (current = 1, filterStatus = status) => {
      setLoading(true);
      try {
        const params = { page: current, size: pageSize };
        if (filterStatus) params.status = filterStatus;
        const data = await getMyOrders(params);
        setRecords(data.records || []);
        setTotal(data.total ?? 0);
        setPage(data.current ?? current);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    },
    [status],
  );

  useEffect(() => {
    loadOrders(1, status);
  }, [status, loadOrders]);

  const handleTabChange = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key) next.set('status', key);
    else next.delete('status');
    setSearchParams(next);
  };

  const runAction = async (orderId, action, successMsg) => {
    setActingId(orderId);
    try {
      await action();
      message.success(successMsg);
      await loadOrders(page, status);
    } catch {
      // 错误已提示
    } finally {
      setActingId(null);
    }
  };

  return (
    <div>
      {/* Hero 标题 */}
      <div className="page-hero" style={{ marginBottom: 28 }}>
        <Title level={2} className="page-hero-title" style={{ margin: 0 }}>
          <ShoppingOutlined style={{ marginRight: 12 }} />
          我的订单
        </Title>
        <Text
          className="page-hero-subtitle"
          style={{ display: 'block', marginTop: 10, color: '#ffe58f' }}
        >
          查看订单状态，管理您的购物记录
        </Text>
      </div>

      <Card
        styles={{
          header: { borderBottom: '1px solid rgba(106,0,95,0.08)', paddingBottom: 8, paddingTop: 8 },
          body: { padding: '20px 0' },
        }}
        style={{
          borderRadius: 16,
          border: '1px solid rgba(106,0,95,0.08)',
          boxShadow: '0 4px 12px rgba(106,0,95,0.06)',
        }}
        title={
          <Tabs
            activeKey={status}
            onChange={handleTabChange}
            items={ORDER_STATUS_TABS.map((tab) => ({
              key: tab.key,
              label: (
                <span style={{ fontSize: 14, fontWeight: 600, padding: '4px 4px' }}>
                  {tab.label}
                </span>
              ),
            }))}
            className="brand-underline-tabs"
            size="large"
            style={{ margin: 0 }}
          />
        }
      >
        <Spin spinning={loading}>
          {records.length === 0 && !loading ? (
            <Empty
              description={<span style={{ color: '#6a005f', fontWeight: 600 }}>暂无订单</span>}
              style={{ padding: '40px 0' }}
            >
              <Link to="/">
                <Button type="primary" size="large" className="primary-gradient-btn">
                  <ShoppingOutlined /> 去逛逛
                </Button>
              </Link>
            </Empty>
          ) : (
            <>
              <div style={{ display: 'grid', gap: 16, padding: '0 8px' }}>
                {records.map((record) => {
                  const statusMeta = getOrderStatusMeta(record.status);
                  const isPending = record.status === 'PENDING_PAYMENT';
                  const isShipped = record.status === 'SHIPPED';
                  return (
                    <Card
                      key={record.id}
                      styles={{
                        body: { padding: 0 },
                      }}
                      style={{
                        borderRadius: 12,
                        border: '1px solid rgba(106,0,95,0.08)',
                        boxShadow: '0 2px 8px rgba(106,0,95,0.04)',
                        transition: 'all 0.2s ease',
                      }}
                      hoverable
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(106,0,95,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(106,0,95,0.04)';
                      }}
                    >
                      <div
                        style={{
                          padding: '14px 20px',
                          background: 'linear-gradient(90deg, rgba(106,0,95,0.04), rgba(212,177,6,0.03))',
                          borderBottom: '1px dashed rgba(106,0,95,0.08)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <Space size={16} wrap>
                          <Text style={{ color: '#595959', fontSize: 13 }}>
                            订单号：
                          </Text>
                          <Text strong style={{ color: '#1f1f1f', fontSize: 14 }}>
                            #{record.id}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.createdAt?.replace('T', ' ')}
                          </Text>
                          {record.storeName && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              店铺：{record.storeName}
                            </Text>
                          )}
                        </Space>
                        <Tag
                          color={statusMeta.color}
                          style={{
                            margin: 0,
                            fontWeight: 600,
                            padding: '4px 14px',
                            fontSize: 13,
                          }}
                        >
                          {statusMeta.label}
                        </Tag>
                      </div>

                      <div style={{ padding: '16px 20px' }}>
                        <Descriptions
                          column={3}
                          size="small"
                          labelStyle={{ color: '#8c8c8c', padding: '4px 0', width: 70 }}
                          contentStyle={{ color: '#1f1f1f', padding: '4px 0' }}
                          style={{ marginBottom: 14 }}
                        >
                          <Descriptions.Item label="商品数">
                            <Text strong>{record.itemCount || 0} 件</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="应付金额">
                            <Text strong style={{ color: '#c9a227', fontSize: 16 }}>
                              {formatPrice(record.payableAmount)}
                            </Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="下单时间">
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {record.createdAt?.replace('T', ' ')}
                            </Text>
                          </Descriptions.Item>
                        </Descriptions>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 10,
                            paddingTop: 12,
                            borderTop: '1px dashed rgba(106,0,95,0.06)',
                          }}
                        >
                          <Button
                            size="middle"
                            className="ghost-secondary-btn"
                            onClick={() => navigate(`/orders/${record.id}`)}
                          >
                            <EyeOutlined /> 详情
                          </Button>
                          {isPending && (
                            <>
                              <Button
                                type="primary"
                                size="middle"
                                className="primary-gradient-btn"
                                loading={actingId === record.id}
                                onClick={() =>
                                  runAction(record.id, () => payOrder(record.id), '支付成功')
                                }
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
                                onConfirm={() =>
                                  runAction(record.id, () => cancelOrder(record.id), '订单已取消')
                                }
                              >
                                <Button
                                  size="middle"
                                  danger
                                  loading={actingId === record.id}
                                >
                                  取消订单
                                </Button>
                              </Popconfirm>
                            </>
                          )}
                          {isShipped && (
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
                              onConfirm={() =>
                                runAction(record.id, () => confirmOrder(record.id), '已确认收货')
                              }
                            >
                              <Button
                                type="primary"
                                size="middle"
                                className="primary-gradient-btn"
                                loading={actingId === record.id}
                                style={{
                                  background: 'linear-gradient(135deg, #c9a227, #d4b106) !important',
                                }}
                              >
                                <CheckCircleOutlined /> 确认收货
                              </Button>
                            </Popconfirm>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* 分页 */}
              {total > 0 && (
                <div style={{ marginTop: 28, textAlign: 'center' }}>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    showSizeChanger={false}
                    onChange={(p) => loadOrders(p, status)}
                    itemRender={(pageNum, type, original) => {
                      if (type === 'page') {
                        return (
                          <span
                            style={{
                              color: pageNum === page ? '#fff' : '#6a005f',
                              fontWeight: 600,
                            }}
                          >
                            {pageNum}
                          </span>
                        );
                      }
                      return original;
                    }}
                    style={{
                      '--ant-primary-color': '#6a005f',
                      '--ant-primary-color-hover': '#9b4d94',
                    }}
                  />
                </div>
              )}
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
}

export default OrderList;
