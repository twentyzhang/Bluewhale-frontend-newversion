import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import {
  EnvironmentOutlined,
  FileTextOutlined,
  GiftOutlined,
  MessageOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const QUICK_LINKS = [
  { key: 'cart', to: '/cart', icon: <ShoppingCartOutlined />, label: '购物车', color: '#6a005f' },
  { key: 'orders', to: '/orders', icon: <FileTextOutlined />, label: '我的订单', color: '#1677ff' },
  { key: 'coupons', to: '/coupons', icon: <GiftOutlined />, label: '优惠券', color: '#c41d7f' },
  { key: 'addresses', to: '/profile/addresses', icon: <EnvironmentOutlined />, label: '收货地址', color: '#13c2c2' },
  { key: 'chat', to: '/chat', icon: <MessageOutlined />, label: '客服', color: '#eb2f96' },
  { key: 'search', to: '/search?tab=all', icon: <SearchOutlined />, label: '搜索', color: '#722ed1' },
];

function CustomerQuickLinks({ cartCount = 0 }) {
  return (
    <div className="customer-quick-links">
      <Text type="secondary" className="customer-quick-links-label">
        快捷入口
      </Text>
      <div className="customer-quick-links-row">
        {QUICK_LINKS.map((item) => (
          <Link key={item.key} to={item.to} className="customer-quick-link">
            <span className="customer-quick-link-icon" style={{ color: item.color }}>
              {item.icon}
            </span>
            <Text className="customer-quick-link-text">{item.label}</Text>
            {item.key === 'cart' && cartCount > 0 && (
              <Text type="secondary" className="customer-quick-link-badge">
                {cartCount}
              </Text>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CustomerQuickLinks;
