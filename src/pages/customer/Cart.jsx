import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Image,
  InputNumber,
  Popconfirm,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from 'antd';
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from '../../api/cart';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/format';
import '../../styles/browse.css';

const { Title, Text, Paragraph } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="#f5f0f7" width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#b67fc0" font-size="12">暂无图片</text></svg>',
  );

function isDelistedItem(item) {
  return item.productName === '（商品已下架）' || Number(item.price) === 0;
}

function Cart() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCart({
        items: data.items || [],
        total: data.total ?? 0,
      });
      setSelectedRowKeys((prev) =>
        prev.filter((key) => (data.items || []).some((item) => item.id === key)),
      );
    } catch {
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (item, quantity) => {
    if (quantity === item.quantity) return;
    setUpdatingId(item.id);
    try {
      if (quantity <= 0) {
        await removeCartItem(item.id);
        message.success('已移除商品');
      } else {
        await updateCartItem(item.id, { quantity });
        message.success('数量已更新');
      }
      await loadCart();
      await refreshCart();
    } catch {
      // 错误已在拦截器提示
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setUpdatingId(itemId);
    try {
      await removeCartItem(itemId);
      message.success('已删除');
      await loadCart();
      await refreshCart();
    } catch {
      // 错误已在拦截器提示
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckout = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要结算的商品');
      return;
    }
    navigate('/checkout', { state: { cartItemIds: selectedRowKeys } });
  };

  const selectableItems = cart.items.filter((item) => !isDelistedItem(item));

  const selectedSubtotal = cart.items
    .filter((item) => selectedRowKeys.includes(item.id))
    .reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

  const columns = [
    {
      title: '商品信息',
      dataIndex: 'productName',
      render: (_, record) => (
        <div className="cart-item-product">
          <Image
            src={record.imageUrl || PLACEHOLDER}
            alt={record.productName}
            className="cart-item-image"
            fallback={PLACEHOLDER}
            preview={false}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            {record.productId && !isDelistedItem(record) ? (
              <Link to={`/products/${record.productId}`} style={{ color: '#1f1f1f', fontWeight: 600, fontSize: 15 }}>
                {record.productName}
              </Link>
            ) : (
              <Text type="secondary" style={{ fontWeight: 600, fontSize: 15 }}>
                {record.productName}
              </Text>
            )}
            {isDelistedItem(record) && (
              <Paragraph type="danger" style={{ margin: '6px 0 0', fontSize: 12 }}>
                商品已下架，请移除
              </Paragraph>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      width: 140,
      align: 'center',
      render: (price) => <span className="cart-price">{formatPrice(price)}</span>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={isDelistedItem(record) ? record.quantity : record.stock}
          value={record.quantity}
          disabled={updatingId === record.id || isDelistedItem(record)}
          onChange={(val) => {
            if (val != null) handleQuantityChange(record, val);
          }}
          style={{ width: 120 }}
        />
      ),
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      width: 140,
      align: 'center',
      render: (subtotal) => <span className="cart-subtotal">{formatPrice(subtotal)}</span>,
    },
    {
      title: '操作',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Popconfirm title="确定删除该商品？" onConfirm={() => handleRemove(record.id)}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={updatingId === record.id}
          >
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      {/* Hero 标题横幅 */}
      <div
        className="page-hero"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 28,
        }}
      >
        <div>
          <Title level={2} className="page-hero-title" style={{ margin: 0 }}>
            <ShoppingCartOutlined style={{ marginRight: 12 }} />
            我的购物车
          </Title>
          <Paragraph className="page-hero-subtitle" style={{ margin: '10px 0 0' }}>
            查看您选购的商品，完成结算享受专属优惠
          </Paragraph>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '12px 20px',
            borderRadius: 12,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 13 }}>商品总数</Text>
          <div style={{ color: '#ffe58f', fontSize: 28, fontWeight: 800, lineHeight: 1.2 }}>
            {cart.items.length}
          </div>
        </div>
      </div>

      <Spin spinning={loading}>
        {cart.items.length === 0 && !loading ? (
          <Card style={{ borderRadius: 16, border: '1px solid rgba(106,0,95,0.08)' }}>
            <Empty
              description={
                <span style={{ color: '#6a005f', fontWeight: 600 }}>购物车还是空的</span>
              }
              style={{ padding: '60px 0' }}
            >
              <Link to="/">
                <Button type="primary" size="large" className="primary-gradient-btn">
                  <ShoppingOutlined /> 去逛逛
                </Button>
              </Link>
            </Empty>
          </Card>
        ) : (
          <>
            <Card
              style={{
                borderRadius: 16,
                border: '1px solid rgba(106,0,95,0.08)',
                boxShadow: '0 4px 12px rgba(106,0,95,0.06)',
              }}
              styles={{ body: { padding: 0 } }}
            >
              <Table
                rowKey="id"
                columns={columns}
                dataSource={cart.items}
                pagination={false}
                className="cart-table"
                rowSelection={{
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                  getCheckboxProps: (record) => ({
                    disabled: isDelistedItem(record),
                  }),
                  columnWidth: 60,
                }}
                rowClassName={() => 'cart-row'}
              />
            </Card>

            {/* 结算汇总卡片 */}
            <Card
              style={{
                marginTop: 20,
                borderRadius: 16,
                background:
                  'linear-gradient(135deg, #fff 0%, #fffaf0 100%)',
                border: '2px solid transparent',
                backgroundImage:
                  'linear-gradient(#fff, #fff), linear-gradient(135deg, #6a005f, #d4b106)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                boxShadow: '0 8px 20px rgba(106,0,95,0.1)',
              }}
              styles={{
                body: {
                  padding: '24px 32px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 20,
                },
              }}
            >
              <Space size={24} wrap>
                <Checkbox
                  checked={
                    selectableItems.length > 0 &&
                    selectableItems.every((item) => selectedRowKeys.includes(item.id))
                  }
                  disabled={selectableItems.length === 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRowKeys(selectableItems.map((i) => i.id));
                    } else {
                      setSelectedRowKeys([]);
                    }
                  }}
                  style={{ color: '#6a005f', fontWeight: 600, fontSize: 15 }}
                >
                  全选
                </Checkbox>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  已选 <Text strong style={{ color: '#6a005f', fontSize: 18 }}>{selectedRowKeys.length}</Text> 件商品
                  {selectableItems.length < cart.items.length &&
                    '（已下架商品不可结算）'}
                </Text>
              </Space>

              <Space size={32} align="center" wrap>
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ color: '#6a005f', fontSize: 14, fontWeight: 600 }}>已选合计</Text>
                  <div style={{ lineHeight: 1.1, marginTop: 4 }}>
                    <span style={{ color: '#d4b106', fontSize: 18, fontWeight: 700, marginRight: 2 }}>
                      ¥
                    </span>
                    <span style={{ color: '#c9a227', fontSize: 36, fontWeight: 800, letterSpacing: 1 }}>
                      {Number(selectedSubtotal || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <Space>
                  <Button
                    size="large"
                    className="ghost-secondary-btn"
                    onClick={() => navigate('/')}
                  >
                    <ShoppingOutlined /> 继续购物
                  </Button>
                  <Button
                    size="large"
                    className="primary-gradient-btn"
                    style={{ height: 46, fontSize: 16, paddingLeft: 32, paddingRight: 32 }}
                    disabled={selectedRowKeys.length === 0}
                    onClick={handleCheckout}
                  >
                    去结算 ({selectedRowKeys.length})
                  </Button>
                </Space>
              </Space>
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
}

export default Cart;
