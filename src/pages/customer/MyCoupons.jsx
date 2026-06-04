import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Empty,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { getMyCoupons } from '../../api/coupon';
import { formatCouponValue } from '../../utils/format';
import { formatCouponType, getCouponStatusMeta } from '../../utils/couponStatus';

const { Title } = Typography;

const STATUS_TABS = [
  { key: '', label: '全部' },
  { key: 'UNUSED', label: '未使用' },
  { key: 'USED', label: '已使用' },
  { key: 'EXPIRED', label: '已过期' },
];

function MyCoupons() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [status, setStatus] = useState('');

  const loadCoupons = useCallback(async (filterStatus = status) => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : undefined;
      const data = await getMyCoupons(params);
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadCoupons(status);
  }, [status, loadCoupons]);

  const handleTabChange = (key) => {
    setStatus(key);
  };

  const columns = [
    {
      title: '优惠券',
      dataIndex: 'groupName',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <Tag style={{ marginTop: 4 }}>{formatCouponType(record.type)}</Tag>
        </div>
      ),
    },
    {
      title: '优惠力度',
      width: 120,
      render: (_, record) => formatCouponValue(record),
    },
    {
      title: '使用门槛',
      dataIndex: 'minOrderAmount',
      width: 120,
      render: (val) => `满 ${Number(val).toFixed(2)} 元`,
    },
    {
      title: '适用范围',
      dataIndex: 'storeId',
      width: 120,
      render: (storeId) => (storeId ? <Tag color="blue">店铺券</Tag> : <Tag color="purple">全平台</Tag>),
    },
    {
      title: '有效期至',
      dataIndex: 'expireAt',
      width: 180,
      render: (t) => t?.replace('T', ' '),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => {
        const meta = getCouponStatusMeta(s);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: <Link to="/coupons">优惠券中心</Link> },
          { title: '我的优惠券' },
        ]}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          我的优惠券
        </Title>
        <Link to="/coupons">
          <Button type="primary">去领券</Button>
        </Link>
      </div>
      <Card>
        <Tabs
          activeKey={status}
          items={STATUS_TABS}
          onChange={handleTabChange}
          style={{ marginBottom: 16 }}
        />
        <Spin spinning={loading}>
          {coupons.length === 0 && !loading ? (
            <Empty description="暂无优惠券">
              <Link to="/coupons">去领取</Link>
            </Empty>
          ) : (
            <Table rowKey="id" columns={columns} dataSource={coupons} pagination={false} />
          )}
        </Spin>
      </Card>
    </div>
  );
}

export default MyCoupons;
