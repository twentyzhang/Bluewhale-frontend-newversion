import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { getMyCoupons } from '../../api/coupon';
import { formatCouponValue } from '../../utils/format';
import { formatCouponMinOrder, formatCouponType, getCouponStatusMeta } from '../../utils/couponStatus';
import '../../styles/browse.css';

const { Title, Text } = Typography;

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

  return (
    <div>
      {/* Hero 标题 */}
      <div className="page-hero" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} className="page-hero-title" style={{ margin: 0 }}>
              <GiftOutlined style={{ marginRight: 12 }} />
              我的优惠券
            </Title>
            <Text className="page-hero-subtitle" style={{ display: 'block', marginTop: 10, color: '#ffe58f' }}>
              共 {coupons.length} 张优惠券，合理使用享受更多优惠
            </Text>
          </div>
          <Link to="/coupons">
            <Button
              size="large"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                color: '#fff',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                borderRadius: 10,
              }}
            >
              ← 去领券
            </Button>
          </Link>
        </div>
      </div>

      <Card
        styles={{
          body: { padding: '24px 28px' },
        }}
        style={{
          borderRadius: 16,
          border: '1px solid rgba(106,0,95,0.08)',
          boxShadow: '0 4px 12px rgba(106,0,95,0.06)',
        }}
      >
        <Tabs
          activeKey={status}
          onChange={handleTabChange}
          items={STATUS_TABS.map((tab) => ({
            key: tab.key,
            label: (
              <span style={{ fontSize: 15, fontWeight: 600, padding: '4px 8px' }}>
                {tab.label}
              </span>
            ),
          }))}
          className="brand-underline-tabs"
          style={{ marginBottom: 24 }}
          size="large"
        />

        <Spin spinning={loading}>
          {coupons.length === 0 && !loading ? (
            <Empty
              description={<span style={{ color: '#6a005f', fontWeight: 600 }}>暂无优惠券</span>}
              style={{ padding: '40px 0' }}
            >
              <Link to="/coupons">
                <Button type="primary" size="large" className="primary-gradient-btn">
                  <GiftOutlined /> 去领取
                </Button>
              </Link>
            </Empty>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: 20,
              }}
            >
              {coupons.map((c) => {
                const statusMeta = getCouponStatusMeta(c.status);
                const isExpired = c.status === 'EXPIRED';
                const isUsed = c.status === 'USED';
                const isDisabled = isExpired || isUsed;
                return (
                  <Card
                    key={c.id}
                    className={isDisabled ? 'coupon-card sold-out' : 'coupon-card'}
                    styles={{ body: { padding: 0 } }}
                    hoverable={!isDisabled}
                  >
                    <div style={{ display: 'flex', minHeight: 150 }}>
                      {/* 左侧紫金渐变色值块 */}
                      <div
                        style={{
                          width: 130,
                          flexShrink: 0,
                          background: isDisabled
                            ? 'linear-gradient(135deg, #a0a0a0 0%, #c0c0c0 100%)'
                            : 'linear-gradient(135deg, #6a005f 0%, #9b4d94 60%, #c9a227 100%)',
                          color: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '20px 14px',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 32,
                            fontWeight: 800,
                            lineHeight: 1,
                            letterSpacing: 1,
                            textShadow: '0 2px 8px rgba(0,0,0,0.15)',
                          }}
                        >
                          {formatCouponValue(c)}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.9)',
                            fontWeight: 500,
                            letterSpacing: 1,
                          }}
                        >
                          {formatCouponType(c.type)}
                        </div>
                      </div>

                      {/* 右侧信息 */}
                      <div style={{ flex: 1, padding: '16px 18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <div>
                          <Text strong style={{ color: '#1f1f1f', fontSize: 15, display: 'block' }}>
                            {c.groupName}
                          </Text>
                          <div style={{ marginTop: 6, fontSize: 13, color: '#595959' }}>
                            {formatCouponMinOrder(c)}
                          </div>
                          <Space size={8} wrap style={{ marginTop: 8 }}>
                            {c.storeId ? (
                              <Tag
                                style={{
                                  margin: 0,
                                  background: 'rgba(106,0,95,0.08)',
                                  color: '#6a005f',
                                  border: '1px solid rgba(106,0,95,0.15)',
                                  fontWeight: 500,
                                  padding: '2px 10px',
                                }}
                              >
                                店铺券
                              </Tag>
                            ) : (
                              <Tag
                                style={{
                                  margin: 0,
                                  background: 'rgba(106,0,95,0.08)',
                                  color: '#6a005f',
                                  border: '1px solid rgba(106,0,95,0.15)',
                                  fontWeight: 500,
                                  padding: '2px 10px',
                                }}
                              >
                                全平台
                              </Tag>
                            )}
                            <Tag
                              color={statusMeta.color}
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                padding: '2px 10px',
                              }}
                            >
                              {statusMeta.label}
                            </Tag>
                          </Space>
                        </div>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                            display: 'block',
                            marginTop: 10,
                            color: '#8c8c8c',
                          }}
                        >
                          有效期至 {c.expireAt?.replace('T', ' ')}
                        </Text>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Spin>
      </Card>
    </div>
  );
}

export default MyCoupons;
