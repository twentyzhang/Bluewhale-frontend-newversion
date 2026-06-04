import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  message,
} from 'antd';
import { GiftOutlined, HomeOutlined } from '@ant-design/icons';
import { claimCoupon, listCouponGroups } from '../../api/coupon';
import { formatCouponValue } from '../../utils/format';
import { formatCouponType } from '../../utils/couponStatus';
import { getAuth, isLoggedIn } from '../../utils/auth';
import '../../styles/browse.css';

const { Title, Text, Paragraph } = Typography;
const PAGE_SIZE = 12;

function CouponGroupList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [claimingId, setClaimingId] = useState(null);

  const loadGroups = useCallback(async (current = 1) => {
    setLoading(true);
    try {
      const data = await listCouponGroups({ page: current, size: PAGE_SIZE });
      setRecords(data.records || []);
      setTotal(data.total ?? 0);
      setPage(data.current ?? current);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups(1);
  }, [loadGroups]);

  const handleClaim = async (groupId) => {
    if (!isLoggedIn()) {
      message.info('请先登录后再领取优惠券');
      navigate('/login');
      return;
    }
    const { role } = getAuth();
    if (role !== 'CUSTOMER') {
      message.warning('仅顾客账号可领取优惠券');
      return;
    }
    setClaimingId(groupId);
    try {
      await claimCoupon(groupId);
      message.success('领取成功');
      await loadGroups(page);
    } catch {
      // 错误已提示
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <Title level={2} style={{ marginTop: 0 }}>
            优惠券中心
          </Title>
          <Paragraph type="secondary">领取平台或店铺优惠券，下单时可抵扣</Paragraph>
        </div>
        {isLoggedIn() && getAuth().role === 'CUSTOMER' && (
          <Link to="/coupons/mine">我的优惠券 →</Link>
        )}
      </div>
      <Spin spinning={loading}>
        {records.length === 0 && !loading ? (
          <Empty description="暂无可领取的优惠券" />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {records.map((group) => {
                const soldOut = group.remainCount <= 0;
                return (
                  <Card key={group.id} className="coupon-card" hoverable>
                    <div className="coupon-card-body">
                      <div className="coupon-card-value">
                        <Text className="coupon-card-value-text">{formatCouponValue(group)}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatCouponType(group.type)}
                        </Text>
                      </div>
                      <div className="coupon-card-info">
                        <Text strong>{group.name}</Text>
                        <Paragraph type="secondary" style={{ margin: '4px 0 8px' }}>
                          满 {Number(group.minOrderAmount).toFixed(2)} 元可用
                        </Paragraph>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {group.storeId ? (
                            <Tag color="blue">{group.storeName || '店铺券'}</Tag>
                          ) : (
                            <Tag color="purple">全平台</Tag>
                          )}
                          <Tag>
                            剩余 {group.remainCount}/{group.totalCount}
                          </Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                          有效期至 {group.expireAt?.replace('T', ' ')}
                        </Text>
                        <Button
                          type="primary"
                          icon={<GiftOutlined />}
                          block
                          style={{ marginTop: 12 }}
                          disabled={soldOut}
                          loading={claimingId === group.id}
                          onClick={() => handleClaim(group.id)}
                        >
                          {soldOut ? '已抢光' : '立即领取'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            {total > PAGE_SIZE && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Button disabled={page <= 1} onClick={() => loadGroups(page - 1)}>
                  上一页
                </Button>
                <Text style={{ margin: '0 16px' }}>
                  {page} / {Math.ceil(total / PAGE_SIZE)}
                </Text>
                <Button
                  disabled={page >= Math.ceil(total / PAGE_SIZE)}
                  onClick={() => loadGroups(page + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </Spin>
    </div>
  );
}

export default CouponGroupList;
