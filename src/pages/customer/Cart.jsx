import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
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
import { HomeOutlined, ShoppingOutlined } from '@ant-design/icons';
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from '../../api/cart';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/format';
import '../../styles/browse.css';

const { Title, Text } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect fill="#f0f0f0" width="64" height="64"/></svg>',
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
      title: '商品',
      dataIndex: 'productName',
      render: (_, record) => (
        <Space>
          <Image
            src={record.imageUrl || PLACEHOLDER}
            alt={record.productName}
            width={64}
            height={64}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            fallback={PLACEHOLDER}
            preview={false}
          />
          <div>
            {record.productId && !isDelistedItem(record) ? (
              <Link to={`/products/${record.productId}`}>{record.productName}</Link>
            ) : (
              <Text type={isDelistedItem(record) ? 'secondary' : undefined}>
                {record.productName}
              </Text>
            )}
            {isDelistedItem(record) && (
              <div>
                <Text type="danger" style={{ fontSize: 12 }}>
                  商品已下架，请移除
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: '单价',
      dataIndex: 'price',
      width: 120,
      render: (price) => formatPrice(price),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 140,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={isDelistedItem(record) ? record.quantity : record.stock}
          value={record.quantity}
          disabled={updatingId === record.id || isDelistedItem(record)}
          onChange={(val) => {
            if (val != null) handleQuantityChange(record, val);
          }}
        />
      ),
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      width: 120,
      render: (subtotal) => formatPrice(subtotal),
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Popconfirm title="确定删除该商品？" onConfirm={() => handleRemove(record.id)}>
          <Button type="link" danger loading={updatingId === record.id}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: '购物车' },
        ]}
      />
      <Title level={2} style={{ marginTop: 0 }}>
        <ShoppingOutlined /> 我的购物车
      </Title>
      <Spin spinning={loading}>
        {cart.items.length === 0 && !loading ? (
          <Card>
            <Empty description="购物车是空的">
              <Button type="primary">
                <Link to="/">去逛逛</Link>
              </Button>
            </Empty>
          </Card>
        ) : (
          <Card>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={cart.items}
              pagination={false}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
                getCheckboxProps: (record) => ({
                  disabled: isDelistedItem(record),
                }),
              }}
            />
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <Space>
                <Button onClick={() => navigate('/')}>继续购物</Button>
                <Text type="secondary">
                  已选 {selectedRowKeys.length} 件
                  {selectableItems.length < cart.items.length &&
                    '（已下架商品不可结算）'}
                </Text>
              </Space>
              <Space size="large">
                <Text style={{ fontSize: 16 }}>
                  已选合计：<Text strong style={{ fontSize: 20, color: '#c41d7f' }}>
                    {formatPrice(selectedSubtotal)}
                  </Text>
                </Text>
                <Button
                  type="primary"
                  size="large"
                  disabled={selectedRowKeys.length === 0}
                  onClick={handleCheckout}
                >
                  去结算
                </Button>
              </Space>
            </div>
          </Card>
        )}
      </Spin>
    </div>
  );
}

export default Cart;
