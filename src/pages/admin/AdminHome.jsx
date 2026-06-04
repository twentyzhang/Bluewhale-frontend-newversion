import { Link } from 'react-router-dom';
import { Card, Col, Row, Typography } from 'antd';
import {
  BarChartOutlined,
  GiftOutlined,
  ShopOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { getAuth } from '../../utils/auth';
import '../../styles/browse.css';

const { Title, Paragraph } = Typography;

const QUICK_LINKS = [
  {
    key: 'stores',
    to: '/admin/stores',
    icon: <ShopOutlined />,
    title: '商店管理',
    desc: '创建商店、维护信息',
    color: '#1677ff',
  },
  {
    key: 'categories',
    to: '/admin/categories',
    icon: <TagsOutlined />,
    title: '分类管理',
    desc: '维护商品分类树',
    color: '#722ed1',
  },
  {
    key: 'coupons',
    to: '/admin/coupons',
    icon: <GiftOutlined />,
    title: '全局优惠券',
    desc: '发布平台级优惠券',
    color: '#c41d7f',
  },
  {
    key: 'reports',
    to: '/admin/reports',
    icon: <BarChartOutlined />,
    title: '汇总报表',
    desc: '全平台订单与营收',
    color: '#13c2c2',
  },
];

function AdminHome() {
  const { nickname } = getAuth();

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        你好，{nickname || '管理员'}
      </Title>
      <Paragraph type="secondary">南鲸商城平台管理控制台</Paragraph>
      <Row gutter={[16, 16]}>
        {QUICK_LINKS.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={6}>
            <Link to={item.to}>
              <Card hoverable className="admin-quick-card">
                <div className="admin-quick-icon" style={{ color: item.color }}>
                  {item.icon}
                </div>
                <Title level={5} style={{ marginBottom: 4 }}>
                  {item.title}
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {item.desc}
                </Paragraph>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default AdminHome;
