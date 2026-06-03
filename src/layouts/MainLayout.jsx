import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Typography, Space } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { clearAuth, getAuth } from '../utils/auth';

const { Header, Content } = Layout;
const { Text } = Typography;

const ROLE_LABELS = {
  CUSTOMER: '顾客',
  STAFF: '门店员工',
  ADMIN: '管理员',
};

function MainLayout() {
  const navigate = useNavigate();
  const { nickname, role } = getAuth();

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
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

  const navItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate(homePath),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px',
        }}
      >
        <Space size="large">
          <Text strong style={{ color: '#fff', fontSize: 16 }}>
            南鲸商城
          </Text>
          <Menu
            theme="dark"
            mode="horizontal"
            selectable={false}
            items={navItems}
            style={{ flex: 1, minWidth: 120, border: 'none' }}
          />
        </Space>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', color: '#fff' }}>
            <UserOutlined />
            <span>{nickname || '用户'}</span>
            {role && (
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
                ({ROLE_LABELS[role] || role})
              </Text>
            )}
          </Space>
        </Dropdown>
      </Header>
      <Content style={{ padding: 24, background: '#f5f5f5' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}

export default MainLayout;
