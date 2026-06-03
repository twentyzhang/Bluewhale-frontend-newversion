import { Card, Descriptions, Typography } from 'antd';
import { getAuth } from '../../utils/auth';

const { Title, Paragraph } = Typography;

function StaffHome() {
  const { nickname, storeId } = getAuth();

  return (
    <Card>
      <Title level={2} style={{ marginTop: 0 }}>
        门店工作台
      </Title>
      <Paragraph type="secondary">
        门店端首页占位。后续将接入商品管理、订单发货、报表等功能。
      </Paragraph>
      <Descriptions bordered column={1} size="small" style={{ maxWidth: 480 }}>
        <Descriptions.Item label="员工">{nickname || '—'}</Descriptions.Item>
        <Descriptions.Item label="门店 ID">
          {storeId ?? '未绑定门店'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

export default StaffHome;
