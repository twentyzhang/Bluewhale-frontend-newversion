import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Empty,
  Image,
  Radio,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  CreditCardOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { getProductDetail } from '../../api/product';
import { createAddress, listAddresses } from '../../api/address';
import { getCart } from '../../api/cart';
import { getMyCoupons } from '../../api/coupon';
import { createOrder, previewOrderCoupons } from '../../api/order';
import AddressFormModal from '../../components/AddressFormModal';
import { useCart } from '../../hooks/useCart';
import { canSelectCoupon, formatCouponMinOrder } from '../../utils/couponStatus';
import { formatCouponLabel, formatCouponValue, formatPrice } from '../../utils/format';
import '../../styles/browse.css';

const { Title, Text, Paragraph } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect fill="#f5f0f7" width="60" height="60"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#b67fc0" font-size="10">商品图</text></svg>',
  );

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
  const [previewLoading, setPreviewLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [couponIds, setCouponIds] = useState([]);
  const [preview, setPreview] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressModalLoading, setAddressModalLoading] = useState(false);

  const selectedCoupons = useMemo(
    () => coupons.filter((c) => couponIds.includes(c.id)),
    [coupons, couponIds],
  );

  const selectedTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [items],
  );

  const loadPreview = useCallback(async (cartItems, ids) => {
    if (!cartItems.length) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    try {
      const payload = { cartItemIds: cartItems.map((item) => item.id) };
      if (ids.length) payload.couponIds = ids;
      const data = await previewOrderCoupons(payload);
      setPreview(data);
    } catch {
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

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

        let applicableCoupons = Array.isArray(couponData) ? couponData : [];
        if (selected.length > 0) {
          try {
            const product = await getProductDetail(selected[0].productId);
            const orderStoreId = product.storeId;
            applicableCoupons = applicableCoupons.filter(
              (c) => c.storeId == null || String(c.storeId) === String(orderStoreId),
            );
          } catch {
            // 无法解析店铺时保留全部，由后端校验
          }
        }
        setCoupons(applicableCoupons);
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

  useEffect(() => {
    if (loading || !items.length) return undefined;
    const timer = setTimeout(() => {
      loadPreview(items, couponIds);
    }, 300);
    return () => clearTimeout(timer);
  }, [loading, items, couponIds, loadPreview]);

  const handleCouponChange = (checkedIds) => {
    const nextIds = checkedIds.map(Number);
    if (nextIds.length <= couponIds.length) {
      setCouponIds(nextIds);
      return;
    }
    const addedId = nextIds.find((id) => !couponIds.includes(id));
    const candidate = coupons.find((c) => c.id === addedId);
    if (!candidate) return;
    const check = canSelectCoupon(selectedCoupons, candidate);
    if (!check.ok) {
      message.warning(check.reason);
      return;
    }
    setCouponIds(nextIds);
  };

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
      if (couponIds.length) payload.couponIds = couponIds;
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

  const totalAmount = preview?.totalAmount ?? selectedTotal;
  const discountAmount = preview?.discountAmount ?? 0;
  const payableAmount = preview?.payableAmount ?? selectedTotal;

  if (!cartItemIds.length) return null;

  return (
    <div>
      {/* Hero 标题 */}
      <div className="page-hero" style={{ marginBottom: 28 }}>
        <Title level={2} className="page-hero-title" style={{ margin: 0 }}>
          <CreditCardOutlined style={{ marginRight: 12 }} />
          确认订单
        </Title>
        <Paragraph className="page-hero-subtitle" style={{ margin: '10px 0 0' }}>
          请核对收货地址与购买商品，完成下单
        </Paragraph>
      </div>

      <Spin spinning={loading}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          {/* 左侧：收货地址 + 商品清单 + 优惠券 */}
          <div style={{ display: 'grid', gap: 20 }}>
            {/* 收货地址 */}
            <Card
              className="checkout-section-card"
              styles={{
                header: { borderBottom: '2px solid rgba(106,0,95,0.08)', paddingBottom: 12 },
                body: { padding: '20px 0 0' },
              }}
              title={
                <Space size={8}>
                  <EnvironmentOutlined style={{ color: '#6a005f' }} />
                  <span style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>收货地址</span>
                </Space>
              }
            >
              {addresses.length === 0 ? (
                <Empty description="暂无地址，请先添加" style={{ padding: '20px 0' }}>
                  <Button
                    type="primary"
                    className="primary-gradient-btn"
                    onClick={() => setAddressModalOpen(true)}
                  >
                    <HomeOutlined /> 新增地址
                  </Button>
                </Empty>
              ) : (
                <>
                  <Radio.Group
                    value={addressId}
                    onChange={(e) => setAddressId(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }} size={12}>
                      {addresses.map((addr) => (
                        <Radio
                          key={addr.id}
                          value={addr.id}
                          style={{
                            alignItems: 'flex-start',
                            padding: '14px 16px',
                            borderRadius: 12,
                            border: addressId === addr.id
                              ? '2px solid #6a005f'
                              : '1px solid rgba(106,0,95,0.1)',
                            background: addressId === addr.id
                              ? 'linear-gradient(135deg, rgba(106,0,95,0.04), rgba(212,177,6,0.04))'
                              : '#fff',
                            width: '100%',
                            margin: 0,
                          }}
                        >
                          <div style={{ marginLeft: 8 }}>
                            <Space align="center" size={10} wrap>
                              <Text strong style={{ color: '#1f1f1f', fontSize: 15 }}>
                                {addr.receiverName}
                              </Text>
                              <Text style={{ color: '#595959' }}>{addr.phone}</Text>
                              {addr.isDefault && (
                                <Tag color="purple" style={{ margin: 0 }}>默认</Tag>
                              )}
                            </Space>
                            <Paragraph
                              type="secondary"
                              style={{ margin: '6px 0 0', fontSize: 14, color: '#595959' }}
                            >
                              <EnvironmentOutlined style={{ marginRight: 4, fontSize: 12, color: '#6a005f' }} />
                              {addr.province} {addr.city} {addr.district} {addr.detail}
                            </Paragraph>
                          </div>
                        </Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                  <Space style={{ marginTop: 16 }}>
                    <Button
                      className="ghost-secondary-btn"
                      onClick={() => setAddressModalOpen(true)}
                    >
                      + 新增地址
                    </Button>
                    <Link to="/profile/addresses" style={{ color: '#6a005f' }}>
                      管理地址 →
                    </Link>
                  </Space>
                </>
              )}
            </Card>

            {/* 商品清单 */}
            <Card
              className="checkout-section-card"
              styles={{
                header: { borderBottom: '2px solid rgba(106,0,95,0.08)', paddingBottom: 12 },
                body: { padding: '20px 0 0' },
              }}
              title={
                <Space size={8}>
                  <ShoppingOutlined style={{ color: '#6a005f' }} />
                  <span style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>商品清单</span>
                  <Text type="secondary" style={{ fontSize: 13 }}>（共 {items.length} 件）</Text>
                </Space>
              }
            >
              {items.length === 0 ? (
                <Empty description="所选商品无效或已失效" style={{ padding: '20px 0' }} />
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: 12,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, rgba(106,0,95,0.02), rgba(212,177,6,0.02))',
                        border: '1px solid rgba(106,0,95,0.06)',
                      }}
                    >
                      <Image
                        src={item.imageUrl || PLACEHOLDER}
                        alt={item.productName}
                        width={60}
                        height={60}
                        style={{ objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                        fallback={PLACEHOLDER}
                        preview={false}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link to={`/products/${item.productId}`} style={{ color: '#1f1f1f', fontWeight: 600 }}>
                          {item.productName}
                        </Link>
                        <div style={{ marginTop: 4, fontSize: 13, color: '#595959' }}>
                          数量：<span style={{ color: '#6a005f', fontWeight: 600 }}>×{item.quantity}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>
                          {formatPrice(item.subtotal)}
                        </div>
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                          单价 {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 优惠券 */}
            <Card
              className="checkout-section-card"
              styles={{
                header: { borderBottom: '2px solid rgba(106,0,95,0.08)', paddingBottom: 12 },
                body: { padding: '20px 0 0' },
              }}
              title={
                <Space size={8}>
                  <GiftOutlined style={{ color: '#6a005f' }} />
                  <span style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>优惠券</span>
                  <Text type="secondary" style={{ fontSize: 13 }}>（可选，最多 3 张 · 折扣/满减/直减各 1 张）</Text>
                </Space>
              }
            >
              {coupons.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    暂无可用优惠券，
                  </Text>
                  <Link to="/coupons" style={{ color: '#6a005f', fontWeight: 600 }}>
                    去领券 →
                  </Link>
                </div>
              ) : (
                <Checkbox.Group
                  value={couponIds}
                  onChange={handleCouponChange}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size={10}>
                    {coupons.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          borderRadius: 12,
                          background: couponIds.includes(c.id)
                            ? 'linear-gradient(135deg, rgba(106,0,95,0.06), rgba(212,177,6,0.06))'
                            : 'rgba(106,0,95,0.02)',
                          border: couponIds.includes(c.id)
                            ? '1.5px solid #6a005f'
                            : '1px solid rgba(106,0,95,0.08)',
                        }}
                      >
                        <Checkbox value={c.id} style={{ margin: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text strong style={{ color: '#1f1f1f', fontSize: 14 }}>
                            {formatCouponLabel(c)}
                          </Text>
                          <div style={{ marginTop: 4, fontSize: 12, color: '#595959' }}>
                            {formatCouponMinOrder(c)}
                          </div>
                        </div>
                        <Tag
                          color="gold"
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            padding: '4px 10px',
                            color: '#c9a227',
                            background: 'rgba(212,177,6,0.12)',
                            border: '1px solid rgba(212,177,6,0.3)',
                          }}
                        >
                          {formatCouponValue(c)}
                        </Tag>
                      </div>
                    ))}
                  </Space>
                </Checkbox.Group>
              )}
            </Card>
          </div>

          {/* 右侧：金额汇总 + 提交 */}
          <div style={{ position: 'sticky', top: 24 }}>
            <Card
              styles={{
                body: { padding: 0 },
              }}
              style={{
                borderRadius: 16,
                background:
                  'linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #6a005f, #d4b106) border-box',
                border: '2px solid transparent',
                boxShadow: '0 10px 28px rgba(106,0,95,0.12)',
              }}
            >
              <div
                style={{
                  padding: '24px 28px 20px',
                  background: 'linear-gradient(135deg, rgba(106,0,95,0.04), rgba(212,177,6,0.04))',
                  borderRadius: '16px 16px 0 0',
                  borderBottom: '1px dashed rgba(106,0,95,0.12)',
                }}
              >
                <Text
                  style={{
                    color: '#6a005f',
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  金额汇总
                </Text>
              </div>

              <Spin spinning={previewLoading}>
                <div style={{ padding: '20px 28px' }}>
                  <Descriptions
                    column={1}
                    size="small"
                    labelStyle={{ color: '#595959', padding: '8px 0', width: 100 }}
                    contentStyle={{ color: '#1f1f1f', padding: '8px 0', textAlign: 'right' }}
                    style={{ marginBottom: 16 }}
                  >
                    <Descriptions.Item label="商品合计">
                      <Text style={{ fontSize: 15, fontWeight: 600 }}>
                        {formatPrice(totalAmount)}
                      </Text>
                    </Descriptions.Item>
                    {discountAmount > 0 && (
                      <Descriptions.Item label="优惠减免">
                        <Text style={{ color: '#52c41a', fontSize: 15, fontWeight: 700 }}>
                          - {formatPrice(discountAmount)}
                        </Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  <div
                    style={{
                      padding: '16px 0 8px',
                      borderTop: '2px dashed rgba(106,0,95,0.12)',
                      textAlign: 'right',
                    }}
                  >
                    <Text style={{ color: '#6a005f', fontSize: 14, fontWeight: 600 }}>应付金额</Text>
                    <div style={{ lineHeight: 1.1, marginTop: 6 }}>
                      <span
                        style={{
                          color: '#d4b106',
                          fontSize: 22,
                          fontWeight: 700,
                          marginRight: 4,
                        }}
                      >
                        ¥
                      </span>
                      <span
                        style={{
                          color: '#c9a227',
                          fontSize: 40,
                          fontWeight: 800,
                          letterSpacing: 1,
                        }}
                      >
                        {Number(payableAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {preview?.appliedCouponIds?.length > 0 && (
                    <Paragraph
                      type="secondary"
                      style={{
                        margin: '12px 0 0',
                        fontSize: 12,
                        color: '#8c8c8c',
                        textAlign: 'right',
                      }}
                    >
                      已应用优惠券：{preview.appliedCouponIds.join('、')}
                    </Paragraph>
                  )}
                </div>
              </Spin>

              <div style={{ padding: '0 28px 28px' }}>
                <Button
                  type="primary"
                  size="large"
                  block
                  loading={submitting}
                  disabled={!addressId || items.length === 0}
                  onClick={handleSubmit}
                  style={{
                    height: 52,
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: 2,
                    background: 'linear-gradient(135deg, #6a005f 0%, #9b4d94 50%, #c9a227 100%)',
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: '0 6px 18px rgba(106,0,95,0.25)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <CreditCardOutlined /> 提交订单
                </Button>
                <Paragraph
                  style={{
                    margin: '14px 0 0',
                    fontSize: 12,
                    color: '#8c8c8c',
                    textAlign: 'center',
                  }}
                >
                  提交即表示同意 <span style={{ color: '#6a005f' }}>《购物服务协议》</span>
                </Paragraph>
              </div>
            </Card>
          </div>
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
