import { useEffect, useState } from 'react';
import { Card, Descriptions, Spin, Typography } from 'antd';
import { getMe } from '../api/user';
import { getAuth } from '../utils/auth';

const { Title, Paragraph } = Typography;

const ROLE_LABELS = {
  CUSTOMER: '顾客',
  STAFF: '门店员工',
  ADMIN: '管理员',
};

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const cached = getAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getMe();
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) {
          setUser({ nickname: cached.nickname, role: cached.role });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅挂载时拉取
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card>
      <Title level={2} style={{ marginTop: 0 }}>
        欢迎，{user?.nickname || cached.nickname || '用户'}
      </Title>
      <Paragraph type="secondary">
        顾客端首页占位。后续将接入商店列表、商品浏览等功能。
      </Paragraph>
      <Descriptions bordered column={1} size="small" style={{ maxWidth: 480 }}>
        <Descriptions.Item label="身份">
          {ROLE_LABELS[user?.role] || user?.role}
        </Descriptions.Item>
        <Descriptions.Item label="手机号">{user?.phone || '—'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

export default Dashboard;
