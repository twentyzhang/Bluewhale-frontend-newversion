import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Button, Dropdown, Input, Layout, Menu, Space, Typography, Badge } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  SearchOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  BarChartOutlined,
  GiftOutlined,
  ShopOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { clearAuth, getAuth, isLoggedIn } from '../utils/auth';
import { useCart } from '../hooks/useCart';

const { Header, Content } = Layout;
const { Text } = Typography;

const ROLE_LABELS = {
  CUSTOMER: '顾客',
  STAFF: '门店员工',
  ADMIN: '管理员',
};

function MainLayout() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const { nickname, role } = getAuth();
  const { itemCount, refreshCart } = useCart();
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    refreshCart();
  }, [loggedIn, role, refreshCart]);

  const handleLogout = () => {
    clearAuth();
    navigate('/', { replace: true });
  };

  const handleSearch = (value) => {
    const keyword = (value ?? searchKeyword).trim();
    if (keyword) {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    } else {
      navigate('/search');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => navigate('/profile/password'),
    },
    ...(role === 'CUSTOMER'
      ? [
          {
            key: 'addresses',
            icon: <EnvironmentOutlined />,
            label: '收货地址',
            onClick: () => navigate('/profile/addresses'),
          },
          {
            key: 'my-coupons',
            icon: <GiftOutlined />,
            label: '我的优惠券',
            onClick: () => navigate('/coupons/mine'),
          },
        ]
      : []),
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const homePath =
    role === 'STAFF' ? '/staff' : role === 'ADMIN' ? '/admin' : '/';

  const navItems = [];

  if (loggedIn && role === 'ADMIN') {
    navItems.push(
      { key: 'admin', icon: <HomeOutlined />, label: '控制台', onClick: () => navigate('/admin') },
      { key: 'admin-stores', icon: <ShopOutlined />, label: '商店', onClick: () => navigate('/admin/stores') },
      { key: 'admin-categories', icon: <TagsOutlined />, label: '分类', onClick: () => navigate('/admin/categories') },
      { key: 'admin-coupons', icon: <GiftOutlined />, label: '优惠券', onClick: () => navigate('/admin/coupons') },
      { key: 'admin-reports', icon: <BarChartOutlined />, label: '报表', onClick: () => navigate('/admin/reports') },
    );
  } else if (loggedIn && role === 'STAFF') {
    navItems.push(
      { key: 'staff', icon: <HomeOutlined />, label: '工作台', onClick: () => navigate('/staff') },
      { key: 'staff-products', icon: <ShoppingOutlined />, label: '商品', onClick: () => navigate('/staff/products') },
      { key: 'staff-orders', icon: <UnorderedListOutlined />, label: '订单', onClick: () => navigate('/staff/orders') },
      { key: 'staff-coupons', icon: <GiftOutlined />, label: '优惠券', onClick: () => navigate('/staff/coupons') },
      { key: 'staff-reports', icon: <BarChartOutlined />, label: '报表', onClick: () => navigate('/staff/reports') },
    );
  } else {
    navItems.push(
      {
        key: 'home',
        icon: <HomeOutlined />,
        label: '首页',
        onClick: () => navigate(loggedIn ? homePath : '/'),
      },
      {
        key: 'search',
        icon: <SearchOutlined />,
        label: '搜商品',
        onClick: () => navigate('/search'),
      },
      {
        key: 'coupons',
        icon: <GiftOutlined />,
        label: '优惠券',
        onClick: () => navigate('/coupons'),
      },
    );

    if (loggedIn && role === 'CUSTOMER') {
      navItems.push(
        {
          key: 'cart',
          icon: <ShoppingCartOutlined />,
          label: (
            <Badge count={itemCount} size="small" offset={[4, 0]}>
              购物车
            </Badge>
          ),
          onClick: () => navigate('/cart'),
        },
        {
          key: 'orders',
          icon: <FileTextOutlined />,
          label: '我的订单',
          onClick: () => navigate('/orders'),
        },
      );
    }
  }

  const showCustomerSearch = !(loggedIn && (role === 'ADMIN' || role === 'STAFF'));

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px',
          gap: 16,
        }}
      >
        <Space size="large">
          <Text
            strong
            style={{ color: '#fff', fontSize: 16, cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => navigate('/')}
          >
            南鲸商城
          </Text>
          <Menu
            theme="dark"
            mode="horizontal"
            selectable={false}
            items={navItems}
            style={{ flex: 1, minWidth: 160, border: 'none' }}
          />
        </Space>
        {showCustomerSearch && (
          <Input.Search
            placeholder="搜索商品"
            allowClear
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ maxWidth: 280, display: 'none' }}
            className="header-search-desktop"
          />
        )}
        {loggedIn ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', color: '#fff', whiteSpace: 'nowrap' }}>
              <UserOutlined />
              <span>{nickname || '用户'}</span>
              {role && (
                <Text
                  style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}
                >
                  ({ROLE_LABELS[role] || role})
                </Text>
              )}
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button type="link" style={{ color: '#fff' }}>
              <Link to="/login" style={{ color: 'inherit' }}>
                登录
              </Link>
            </Button>
            <Button type="primary" ghost>
              <Link to="/register" style={{ color: 'inherit' }}>
                注册
              </Link>
            </Button>
          </Space>
        )}
      </Header>
      <Content style={{ padding: 24, background: '#f5f5f5' }}>
        <Outlet />
      </Content>
      <style>{`
        @media (min-width: 768px) {
          .header-search-desktop { display: inline-flex !important; }
        }
      `}</style>
    </Layout>
  );
}

export default MainLayout;
