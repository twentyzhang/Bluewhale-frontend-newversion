import { Link } from 'react-router-dom';
import { Card, Col, Row, Typography } from 'antd';
import {
  BarChartOutlined,
  GiftOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { getAuth } from '../../utils/auth';
import StaffStoreGuard from '../../components/StaffStoreGuard';
import '../../styles/browse.css';

const { Title, Paragraph, Text } = Typography;

const QUICK_LINKS = [
  {
    key: 'products',
    to: '/staff/products',
    icon: <ShoppingOutlined />,
    title: '商品管理',
    desc: '上架、编辑、库存',
    color: '#1677ff',
  },
  {
    key: 'orders',
    to: '/staff/orders',
    icon: <UnorderedListOutlined />,
    title: '门店订单',
    desc: '处理发货',
    color: '#722ed1',
  },
  {
    key: 'coupons',
    to: '/staff/coupons',
    icon: <GiftOutlined />,
    title: '店铺优惠券',
    desc: '发布本店券',
    color: '#c41d7f',
  },
  {
    key: 'reports',
    to: '/staff/reports',
    icon: <BarChartOutlined />,
    title: '门店报表',
    desc: '订单与营收',
    color: '#13c2c2',
  },
  {
    key: 'categories',
    to: '/staff/categories',
    icon: <TagsOutlined />,
    title: '分类管理',
    desc: '新建商品分类',
    color: '#fa8c16',
  },
];

function StaffHome() {
  const { nickname, storeId } = getAuth();

  return (
    <StaffStoreGuard>
      <Title level={3} style={{ marginTop: 0 }}>
        你好，{nickname || '店员'}
      </Title>
      <Paragraph type="secondary">
        门店 ID：{storeId} · 南鲸商城门店工作台
      </Paragraph>
      <Row gutter={[16, 16]}>
        {QUICK_LINKS.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={8}>
            <Link to={item.to}>
              <Card hoverable className="admin-quick-card">
                <div className="admin-quick-icon" style={{ color: item.color }}>
                  {item.icon}
                </div>
                <Title level={5} style={{ marginBottom: 4 }}>
                  {item.title}
                </Title>
                <Text type="secondary">{item.desc}</Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </StaffStoreGuard>
  );
}

export default StaffHome;
