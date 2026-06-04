import { Link } from 'react-router-dom';
import { Card, Col, Row, Typography } from 'antd';
import {
  EnvironmentOutlined,
  FileTextOutlined,
  GiftOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useCart } from '../hooks/useCart';

const { Title, Text } = Typography;

const QUICK_LINKS = [
  { key: 'cart', to: '/cart', icon: <ShoppingCartOutlined />, label: '购物车', color: '#6a005f' },
  { key: 'orders', to: '/orders', icon: <FileTextOutlined />, label: '我的订单', color: '#1677ff' },
  { key: 'coupons', to: '/coupons', icon: <GiftOutlined />, label: '优惠券', color: '#c41d7f' },
  { key: 'addresses', to: '/profile/addresses', icon: <EnvironmentOutlined />, label: '收货地址', color: '#13c2c2' },
  { key: 'search', to: '/search', icon: <SearchOutlined />, label: '搜商品', color: '#722ed1' },
];

function CustomerQuickLinks({ cartCount = 0 }) {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Title level={4} style={{ marginTop: 0 }}>
        快捷入口
      </Title>
      <Row gutter={[16, 16]}>
        {QUICK_LINKS.map((item) => (
          <Col key={item.key} xs={12} sm={8} md={4}>
            <Link to={item.to} className="customer-quick-link">
              <div className="customer-quick-link-icon" style={{ color: item.color }}>
                {item.icon}
              </div>
              <Text>{item.label}</Text>
              {item.key === 'cart' && cartCount > 0 && (
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  {cartCount} 件
                </Text>
              )}
            </Link>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default CustomerQuickLinks;
