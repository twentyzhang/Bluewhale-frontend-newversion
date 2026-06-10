import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  GiftOutlined,
  HomeOutlined,
  MessageOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const MENU_ITEMS = [
  { key: '/staff', icon: <HomeOutlined />, label: <Link to="/staff">工作台</Link> },
  {
    key: '/staff/products',
    icon: <ShoppingOutlined />,
    label: <Link to="/staff/products">商品管理</Link>,
  },
  {
    key: '/staff/categories',
    icon: <TagsOutlined />,
    label: <Link to="/staff/categories">分类管理</Link>,
  },
  {
    key: '/staff/orders',
    icon: <UnorderedListOutlined />,
    label: <Link to="/staff/orders">门店订单</Link>,
  },
  {
    key: '/staff/coupons',
    icon: <GiftOutlined />,
    label: <Link to="/staff/coupons">店铺优惠券</Link>,
  },
  {
    key: '/staff/chat',
    icon: <MessageOutlined />,
    label: <Link to="/staff/chat">在线客服</Link>,
  },
  {
    key: '/staff/reports',
    icon: <BarChartOutlined />,
    label: <Link to="/staff/reports">门店报表</Link>,
  },
  { key: '/', icon: <AppstoreOutlined />, label: <Link to="/">浏览商城</Link> },
];

function getStaffSelectedKey(pathname) {
  if (pathname === '/staff') return '/staff';
  const matches = MENU_ITEMS.filter(
    (item) => item.key !== '/' && item.key !== '/staff' && pathname.startsWith(item.key),
  );
  if (matches.length) {
    return matches.sort((a, b) => b.key.length - a.key.length)[0].key;
  }
  return '/staff';
}

function StaffLayout() {
  const location = useLocation();
  const selectedKey = getStaffSelectedKey(location.pathname);

  return (
    <Layout className="workbench-layout">
      <Sider className="purple-gold-sider" width={240} breakpoint="lg" collapsedWidth={0}>
        <div className="sider-header">
          <h3 className="sider-header__title">门店工作台</h3>
          <p className="sider-header__subtitle">南鲸商城 · 门店管理中心</p>
        </div>
        <Menu
          className="staff-sider-menu"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={MENU_ITEMS}
        />
        <div className="sider-footer">南鲸商城 · v1.0</div>
      </Sider>
      <Content className="workbench-content">
        <Outlet />
      </Content>
    </Layout>
  );
}

export default StaffLayout;
