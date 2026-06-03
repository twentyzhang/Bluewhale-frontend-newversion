import { useNavigate } from 'react-router-dom';
import { Button, Layout, Typography } from 'antd';
import { TOKEN_KEY } from '../api/request';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
        }}
      >
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          首页
        </Title>
        <Button type="primary" ghost onClick={handleLogout}>
          退出登录
        </Button>
      </Header>
      <Content style={{ padding: 24 }}>
        <Title level={2}>欢迎</Title>
        <Paragraph>登录成功，这里是首页占位内容。</Paragraph>
      </Content>
    </Layout>
  );
}

export default Dashboard;
