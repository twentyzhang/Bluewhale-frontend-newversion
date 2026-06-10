import { Link } from 'react-router-dom';
import { Col, Row } from 'antd';
import {
  BarChartOutlined,
  GiftOutlined,
  InboxOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { getAuth } from '../../utils/auth';
import StaffStoreGuard from '../../components/StaffStoreGuard';

const QUICK_LINKS = [
  {
    key: 'products',
    to: '/staff/products',
    icon: <ShoppingOutlined />,
    title: '商品管理',
    desc: '上架、编辑、库存',
  },
  {
    key: 'orders',
    to: '/staff/orders',
    icon: <UnorderedListOutlined />,
    title: '门店订单',
    desc: '处理发货',
  },
  {
    key: 'coupons',
    to: '/staff/coupons',
    icon: <GiftOutlined />,
    title: '店铺优惠券',
    desc: '发布本店券',
  },
  {
    key: 'reports',
    to: '/staff/reports',
    icon: <BarChartOutlined />,
    title: '门店报表',
    desc: '订单与营收',
  },
  {
    key: 'categories',
    to: '/staff/categories',
    icon: <TagsOutlined />,
    title: '分类管理',
    desc: '新建商品分类',
  },
];

const STAFF_STATS = [
  { key: 'orders', label: '订单', value: '--', icon: <UnorderedListOutlined /> },
  { key: 'stock', label: '库存', value: '--', icon: <InboxOutlined /> },
  { key: 'coupons', label: '优惠券', value: '--', icon: <GiftOutlined /> },
  { key: 'reports', label: '报表', value: '--', icon: <BarChartOutlined /> },
];

function StaffHome() {
  const { nickname, storeId } = getAuth();

  return (
    <StaffStoreGuard>
      <div className="dashboard-hero">
        <div className="dashboard-hero__text">
          <h2 className="dashboard-hero__title">
            你好，<span className="dashboard-hero__gold-accent">{nickname || '店员'}</span> · 门店员工
          </h2>
          <p className="dashboard-hero__subtitle">
            南鲸商城门店工作台 · 门店 ID: {storeId || '--'}
          </p>
        </div>
        <div className="dashboard-hero__stats">
          {STAFF_STATS.map((s) => (
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
          <Col key={item.key} xs={24} sm={12} lg={8}>
            <Link to={item.to} className="quick-link-card">
              <div className="quick-link-card__icon">{item.icon}</div>
              <h4 className="quick-link-card__title">{item.title}</h4>
              <p className="quick-link-card__desc">{item.desc}</p>
            </Link>
          </Col>
        ))}
      </Row>
    </StaffStoreGuard>
  );
}

export default StaffHome;
