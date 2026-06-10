import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button, Dropdown, Input, Badge, Layout } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  SearchOutlined,
  ShoppingOutlined,
  MessageOutlined,
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

const ROLE_LABELS = {
  CUSTOMER: '顾客',
  STAFF: '门店员工',
  ADMIN: '管理员',
};

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
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
      navigate(`/search?keyword=${encodeURIComponent(keyword)}&tab=all`);
    } else {
      navigate('/search?tab=all');
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
            key: 'cart',
            icon: <ShoppingCartOutlined />,
            label: itemCount > 0 ? `购物车（${itemCount}）` : '购物车',
            onClick: () => navigate('/cart'),
          },
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
          {
            key: 'chat',
            icon: <MessageOutlined />,
            label: '在线客服',
            onClick: () => navigate('/chat'),
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
      { key: '/admin', icon: <HomeOutlined />, label: '控制台', onClick: () => navigate('/admin') },
      { key: '/admin/stores', icon: <ShopOutlined />, label: '商店', onClick: () => navigate('/admin/stores') },
      { key: '/admin/categories', icon: <TagsOutlined />, label: '分类', onClick: () => navigate('/admin/categories') },
      { key: '/admin/coupons', icon: <GiftOutlined />, label: '优惠券', onClick: () => navigate('/admin/coupons') },
      { key: '/admin/reports', icon: <BarChartOutlined />, label: '报表', onClick: () => navigate('/admin/reports') },
    );
  } else if (loggedIn && role === 'STAFF') {
    navItems.push(
      { key: '/staff', icon: <HomeOutlined />, label: '工作台', onClick: () => navigate('/staff') },
      { key: '/staff/products', icon: <ShoppingOutlined />, label: '商品', onClick: () => navigate('/staff/products') },
      { key: '/staff/orders', icon: <UnorderedListOutlined />, label: '订单', onClick: () => navigate('/staff/orders') },
      { key: '/staff/coupons', icon: <GiftOutlined />, label: '优惠券', onClick: () => navigate('/staff/coupons') },
      { key: '/staff/reports', icon: <BarChartOutlined />, label: '报表', onClick: () => navigate('/staff/reports') },
    );
  } else {
    navItems.push(
      {
        key: '/',
        icon: <HomeOutlined />,
        label: '首页',
        onClick: () => navigate(loggedIn ? homePath : '/'),
      },
      {
        key: '/search',
        icon: <SearchOutlined />,
        label: '搜索',
        onClick: () => navigate('/search?tab=all'),
      },
      {
        key: '/stores',
        icon: <ShopOutlined />,
        label: '商店',
        onClick: () => navigate('/stores'),
      },
      {
        key: '/coupons',
        icon: <GiftOutlined />,
        label: '优惠券',
        onClick: () => navigate('/coupons'),
      },
    );

    if (loggedIn && role === 'CUSTOMER') {
      navItems.push(
        {
          key: '/cart',
          icon: (
            <Badge count={itemCount} size="small" offset={[-2, 4]}>
              <ShoppingCartOutlined />
            </Badge>
          ),
          label: '购物车',
          onClick: () => navigate('/cart'),
        },
        {
          key: '/orders',
          icon: <FileTextOutlined />,
          label: '我的订单',
          onClick: () => navigate('/orders'),
        },
      );
    }
  }

  const showCustomerSearch = !(loggedIn && (role === 'ADMIN' || role === 'STAFF'));

  const currentPath = location.pathname;

  const getAvatarChar = () => {
    if (nickname && nickname.length > 0) {
      return nickname.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="app-header">
        <div className="app-header__brand" onClick={() => navigate(loggedIn ? homePath : '/')}>
          <div className="app-header__logo">鲸</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="app-header__title">南鲸商城</span>
            {role && <span className="app-header__role-tag">{ROLE_LABELS[role] || role}</span>}
          </div>
        </div>

        <div className="app-header__nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`app-header__nav-link${currentPath === item.key || (item.key !== '/' && currentPath.startsWith(item.key)) ? ' active' : ''}`}
              onClick={item.onClick}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="app-header__right">
          {showCustomerSearch && (
            <Input.Search
              placeholder="搜索商店或商品"
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              className="app-header__search"
              size="middle"
            />
          )}
          {loggedIn ? (
            <>
              {role === 'CUSTOMER' && (
                <Badge count={itemCount} size="small" offset={[-2, 2]}>
                  <Button
                    type="text"
                    className="app-header__cart-btn"
                    icon={<ShoppingCartOutlined />}
                    aria-label="购物车"
                    onClick={() => navigate('/cart')}
                  />
                </Badge>
              )}
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="app-header__user">
                  <div className="app-header__avatar">{getAvatarChar()}</div>
                  <span className="app-header__username">{nickname || '用户'}</span>
                </div>
              </Dropdown>
            </>
          ) : (
            <>
              <Button className="app-header__auth-btn">
                <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                  登录
                </Link>
              </Button>
              <Button className="app-header__auth-btn app-header__auth-btn--primary">
                <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>
                  注册
                </Link>
              </Button>
            </>
          )}
        </div>
      </Header>
      <Content className="app-content">
        <Outlet />
      </Content>
    </Layout>
  );
}

export default MainLayout;
