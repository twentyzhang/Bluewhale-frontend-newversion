import { Card, Typography } from 'antd';
import { getAuth } from '../../utils/auth';

const { Title, Paragraph } = Typography;

function AdminHome() {
  const { nickname } = getAuth();

  return (
    <Card>
      <Title level={2} style={{ marginTop: 0 }}>
        管理后台
      </Title>
      <Paragraph type="secondary">
        管理员首页占位。后续将接入商店管理、全局优惠券、汇总报表等功能。
      </Paragraph>
      <Paragraph>当前用户：{nickname || '—'}</Paragraph>
    </Card>
  );
}

export default AdminHome;
