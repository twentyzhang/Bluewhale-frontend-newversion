import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  GiftOutlined,
  HomeOutlined,
  ShopOutlined,
  TagsOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const MENU_ITEMS = [
  { key: '/admin', icon: <HomeOutlined />, label: <Link to="/admin">控制台</Link> },
  { key: '/admin/stores', icon: <ShopOutlined />, label: <Link to="/admin/stores">商店管理</Link> },
  {
    key: '/admin/categories',
    icon: <TagsOutlined />,
    label: <Link to="/admin/categories">分类管理</Link>,
  },
  {
    key: '/admin/coupons',
    icon: <GiftOutlined />,
    label: <Link to="/admin/coupons">全局优惠券</Link>,
  },
  {
    key: '/admin/reports',
    icon: <BarChartOutlined />,
    label: <Link to="/admin/reports">汇总报表</Link>,
  },
  { key: '/', icon: <AppstoreOutlined />, label: <Link to="/">浏览商城</Link> },
];

function getAdminSelectedKey(pathname) {
  if (pathname === '/admin') return '/admin';
  const matches = MENU_ITEMS.filter(
    (item) => item.key !== '/' && item.key !== '/admin' && pathname.startsWith(item.key),
  );
  if (matches.length) {
    return matches.sort((a, b) => b.key.length - a.key.length)[0].key;
  }
  return '/admin';
}

function AdminLayout() {
  const location = useLocation();
  const selectedKey = getAdminSelectedKey(location.pathname);

  return (
    <Layout className="workbench-layout">
      <Sider className="purple-gold-sider" width={240} breakpoint="lg" collapsedWidth={0}>
        <div className="sider-header">
          <h3 className="sider-header__title">管理后台</h3>
          <p className="sider-header__subtitle">南鲸商城 · 超级管理员</p>
        </div>
        <Menu
          className="admin-sider-menu"
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

export default AdminLayout;
