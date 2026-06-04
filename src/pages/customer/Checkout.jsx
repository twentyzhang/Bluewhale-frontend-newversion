import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Empty,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { createAddress, listAddresses } from '../../api/address';
import { getCart } from '../../api/cart';
import { getMyCoupons } from '../../api/coupon';
import { createOrder } from '../../api/order';
import AddressFormModal from '../../components/AddressFormModal';
import { useCart } from '../../hooks/useCart';
import { formatAddress, formatCouponLabel, formatPrice } from '../../utils/format';

const { Title, Text, Paragraph } = Typography;

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCart } = useCart();
  const cartItemIds = useMemo(
    () => location.state?.cartItemIds || [],
    [location.state?.cartItemIds],
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [couponId, setCouponId] = useState(undefined);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressModalLoading, setAddressModalLoading] = useState(false);

  const selectedTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [items],
  );

  useEffect(() => {
    if (!cartItemIds.length) {
      message.warning('请从购物车选择商品后再结算');
      navigate('/cart', { replace: true });
    }
  }, [cartItemIds, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [cartData, addressData, couponData] = await Promise.all([
          getCart(),
          listAddresses(),
          getMyCoupons({ status: 'UNUSED' }),
        ]);
        if (cancelled) return;
        const idSet = new Set(cartItemIds);
        const selected = (cartData.items || []).filter((item) => idSet.has(item.id));
        setItems(selected);
        const addrList = Array.isArray(addressData) ? addressData : [];
        setAddresses(addrList);
        setCoupons(Array.isArray(couponData) ? couponData : []);
        const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
        setAddressId(defaultAddr?.id ?? null);
      } catch {
        if (!cancelled) {
          setItems([]);
          setAddresses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cartItemIds]);

  const handleAddAddress = async (values) => {
    setAddressModalLoading(true);
    try {
      const result = await createAddress(values);
      message.success('地址已添加');
      setAddressModalOpen(false);
      const addrList = await listAddresses();
      setAddresses(addrList);
      setAddressId(result.id);
    } catch {
      // 错误已提示
    } finally {
      setAddressModalLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!addressId) {
      message.warning('请选择收货地址');
      return;
    }
    if (!items.length) {
      message.warning('没有可结算的商品');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        cartItemIds: items.map((item) => item.id),
        addressId,
      };
      if (couponId) payload.couponId = couponId;
      const result = await createOrder(payload);
      message.success('订单创建成功');
      await refreshCart();
      navigate(`/orders/${result.orderId}`, { replace: true });
    } catch {
      // 错误已提示
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { title: '商品', dataIndex: 'productName' },
    { title: '单价', dataIndex: 'price', render: formatPrice, width: 100 },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '小计', dataIndex: 'subtotal', render: formatPrice, width: 100 },
  ];

  if (!cartItemIds.length) return null;

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: <Link to="/cart">购物车</Link> },
          { title: '确认订单' },
        ]}
      />
      <Title level={2} style={{ marginTop: 0 }}>
        确认订单
      </Title>
      <Spin spinning={loading}>
        <div style={{ display: 'grid', gap: 16 }}>
          <Card title="收货地址">
            {addresses.length === 0 ? (
              <Empty description="暂无地址，请先添加">
                <Button type="primary" onClick={() => setAddressModalOpen(true)}>
                  新增地址
                </Button>
              </Empty>
            ) : (
              <>
                <Radio.Group
                  value={addressId}
                  onChange={(e) => setAddressId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {addresses.map((addr) => (
                      <Radio key={addr.id} value={addr.id} style={{ alignItems: 'flex-start' }}>
                        <div>
                          <Text strong>
                            {addr.receiverName} {addr.phone}
                            {addr.isDefault && (
                              <Text type="secondary">（默认）</Text>
                            )}
                          </Text>
                          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            {formatAddress(addr)}
                          </Paragraph>
                        </div>
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
                <Space style={{ marginTop: 16 }}>
                  <Button onClick={() => setAddressModalOpen(true)}>新增地址</Button>
                  <Link to="/profile/addresses">管理地址</Link>
                </Space>
              </>
            )}
          </Card>
          <Card title="商品清单">
            {items.length === 0 ? (
              <Empty description="所选商品无效或已失效" />
            ) : (
              <Table rowKey="id" columns={columns} dataSource={items} pagination={false} size="small" />
            )}
          </Card>
          <Card title="优惠券（可选）">
            <Select
              allowClear
              placeholder="选择可用优惠券"
              style={{ width: '100%', maxWidth: 480 }}
              value={couponId}
              onChange={setCouponId}
              options={coupons.map((c) => ({
                value: c.id,
                label: formatCouponLabel(c),
              }))}
            />
            {coupons.length === 0 && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                暂无可用优惠券，<Link to="/coupons">去领券</Link>
              </Text>
            )}
          </Card>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text>商品合计：</Text>
                <Text strong style={{ fontSize: 20, color: '#c41d7f' }}>
                  {formatPrice(selectedTotal)}
                </Text>
                <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 8 }}>
                  优惠金额将在提交订单后由后端计算
                </Paragraph>
              </div>
              <Button
                type="primary"
                size="large"
                loading={submitting}
                disabled={!addressId || items.length === 0}
                onClick={handleSubmit}
              >
                提交订单
              </Button>
            </div>
          </Card>
        </div>
      </Spin>
      <AddressFormModal
        open={addressModalOpen}
        title="新增地址"
        initialValues={{}}
        confirmLoading={addressModalLoading}
        onCancel={() => setAddressModalOpen(false)}
        onSubmit={handleAddAddress}
      />
    </div>
  );
}

export default Checkout;
