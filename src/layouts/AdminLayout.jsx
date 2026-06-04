import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import {
  AppstoreOutlined,
  BarChartOutlined,
  GiftOutlined,
  HomeOutlined,
  ShopOutlined,
  TagsOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title } = Typography;

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
    <Layout style={{ background: 'transparent', minHeight: 'calc(100vh - 112px)' }}>
      <Sider
        width={220}
        breakpoint="lg"
        collapsedWidth={0}
        style={{ background: '#fff', borderRadius: 8, marginRight: 16 }}
      >
        <div style={{ padding: '16px 16px 8px' }}>
          <Title level={5} style={{ margin: 0 }}>
            管理后台
          </Title>
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} items={MENU_ITEMS} />
      </Sider>
      <Content style={{ minWidth: 0 }}>
        <Outlet />
      </Content>
    </Layout>
  );
}

export default AdminLayout;
