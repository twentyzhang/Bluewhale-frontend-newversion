import { Link } from 'react-router-dom';
import { Col, Row } from 'antd';
import {
  BarChartOutlined,
  DollarOutlined,
  GiftOutlined,
  ShopOutlined,
  TagsOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { getAuth } from '../../utils/auth';

const QUICK_LINKS = [
  {
    key: 'stores',
    to: '/admin/stores',
    icon: <ShopOutlined />,
    title: '商店管理',
    desc: '创建商店、维护信息',
  },
  {
    key: 'categories',
    to: '/admin/categories',
    icon: <TagsOutlined />,
    title: '分类管理',
    desc: '维护商品分类树',
  },
  {
    key: 'coupons',
    to: '/admin/coupons',
    icon: <GiftOutlined />,
    title: '全局优惠券',
    desc: '发布平台级优惠券',
  },
  {
    key: 'reports',
    to: '/admin/reports',
    icon: <BarChartOutlined />,
    title: '汇总报表',
    desc: '全平台订单与营收',
  },
];

const ADMIN_STATS = [
  { key: 'stores', label: '总门店', value: '--', icon: <ShopOutlined /> },
  { key: 'users', label: '总用户', value: '--', icon: <TeamOutlined /> },
  { key: 'orders', label: '总订单', value: '--', icon: <UnorderedListOutlined /> },
  { key: 'revenue', label: '总收入', value: '--', icon: <DollarOutlined /> },
];

function AdminHome() {
  const { nickname } = getAuth();

  return (
    <div>
      <div className="dashboard-hero">
        <div className="dashboard-hero__text">
          <h2 className="dashboard-hero__title">
            你好，<span className="dashboard-hero__gold-accent">{nickname || '超级管理员'}</span>
          </h2>
          <p className="dashboard-hero__subtitle">南鲸商城平台管理控制台 · 超级管理员</p>
        </div>
        <div className="dashboard-hero__stats">
          {ADMIN_STATS.map((s) => (
            <div className="dashboard-hero__stats-col" key={s.key}>
              <div style={{ fontSize: 14, color: '#f5e090', marginBottom: 4 }}>{s.icon}</div>
              <p className="dashboard-hero__stats-num">{s.value}</p>
              <p className="dashboard-hero__stats-label">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <h3 className="dashboard-section-title">快速入口</h3>
      <Row gutter={[16, 16]}>
        {QUICK_LINKS.map((item) => (
          <Col key={item.key} xs={24} sm={12} lg={6}>
            <Link to={item.to} className="quick-link-card">
              <div className="quick-link-card__icon">{item.icon}</div>
              <h4 className="quick-link-card__title">{item.title}</h4>
              <p className="quick-link-card__desc">{item.desc}</p>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default AdminHome;
