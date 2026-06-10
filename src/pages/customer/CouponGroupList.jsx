import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import { claimCoupon, listCouponGroups } from '../../api/coupon';
import { formatCouponValue } from '../../utils/format';
import { formatCouponMinOrder, formatCouponType } from '../../utils/couponStatus';
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
      {/* Hero 标题 */}
      <div className="page-hero" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={2} className="page-hero-title" style={{ margin: 0 }}>
              <GiftOutlined style={{ marginRight: 12 }} />
              优惠券中心
            </Title>
            <Paragraph
              className="page-hero-subtitle"
              style={{ margin: '10px 0 0', color: '#ffe58f' }}
            >
              领取专属优惠，下单立减，更多惊喜等你发现
            </Paragraph>
          </div>
          {isLoggedIn() && getAuth().role === 'CUSTOMER' && (
            <Link to="/coupons/mine">
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
                我的优惠券 →
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Spin spinning={loading}>
        {records.length === 0 && !loading ? (
          <Card style={{ borderRadius: 16, border: '1px solid rgba(106,0,95,0.08)' }}>
            <Empty
              description={<span style={{ color: '#6a005f', fontWeight: 600 }}>暂无可领取的优惠券</span>}
              style={{ padding: '60px 0' }}
            />
          </Card>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: 20,
              }}
            >
              {records.map((group) => {
                const soldOut = group.remainCount <= 0;
                return (
                  <Card
                    key={group.id}
                    className={soldOut ? 'coupon-card sold-out' : 'coupon-card'}
                    hoverable={!soldOut}
                    styles={{ body: { padding: 0 } }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        minHeight: 160,
                      }}
                    >
                      {/* 左侧紫金渐变色值块 */}
                      <div
                        style={{
                          width: 140,
                          flexShrink: 0,
                          background: 'linear-gradient(135deg, #6a005f 0%, #9b4d94 60%, #c9a227 100%)',
                          color: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '20px 16px',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 80,
                            height: 80,
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                          }}
                        />
                        <div
                          style={{
                            fontSize: 36,
                            fontWeight: 800,
                            lineHeight: 1,
                            letterSpacing: 1,
                            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                        >
                          {formatCouponValue(group)}
                        </div>
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.85)',
                            fontWeight: 500,
                            letterSpacing: 1,
                          }}
                        >
                          {formatCouponType(group.type)}
                        </div>
                      </div>

                      {/* 右侧信息 */}
                      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                        <div>
                          <Text strong style={{ color: '#1f1f1f', fontSize: 15, display: 'block' }}>
                            {group.name}
                          </Text>
                          <Paragraph
                            type="secondary"
                            style={{ margin: '6px 0 0', fontSize: 13, color: '#595959' }}
                          >
                            {formatCouponMinOrder(group)}
                          </Paragraph>
                          <Space size={8} wrap style={{ marginTop: 10 }}>
                            {group.storeId ? (
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
                                {group.storeName || '店铺券'}
                              </Tag>
                            ) : (
                              <Tag
                                style={{
                                  margin: 0,
                                  background: 'linear-gradient(135deg, rgba(106,0,95,0.1), rgba(155,77,148,0.1))',
                                  color: '#6a005f',
                                  border: '1px solid rgba(106,0,95,0.2)',
                                  fontWeight: 600,
                                  padding: '2px 10px',
                                }}
                              >
                                全平台通用
                              </Tag>
                            )}
                            <Tag
                              style={{
                                margin: 0,
                                background: soldOut
                                  ? 'rgba(0,0,0,0.04)'
                                  : 'rgba(212,177,6,0.12)',
                                color: soldOut ? '#8c8c8c' : '#c9a227',
                                border: soldOut
                                  ? '1px solid rgba(0,0,0,0.06)'
                                  : '1px solid rgba(212,177,6,0.3)',
                                fontWeight: 600,
                                padding: '2px 10px',
                              }}
                            >
                              剩余 {group.remainCount}/{group.totalCount}
                            </Tag>
                          </Space>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: 12,
                              display: 'block',
                              marginTop: 10,
                              color: '#8c8c8c',
                            }}
                          >
                            有效期至 {group.expireAt?.replace('T', ' ')}
                          </Text>
                        </div>

                        <Button
                          type="primary"
                          block
                          loading={claimingId === group.id}
                          disabled={soldOut}
                          onClick={() => handleClaim(group.id)}
                          style={{
                            marginTop: 12,
                            height: 40,
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: 2,
                            background: soldOut
                              ? '#d9d9d9'
                              : 'linear-gradient(135deg, #6a005f 0%, #9b4d94 100%)',
                            border: 'none',
                            borderRadius: 10,
                            boxShadow: soldOut
                              ? 'none'
                              : '0 4px 12px rgba(106,0,95,0.2)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                          }}
                        >
                          <GiftOutlined /> {soldOut ? '已抢光' : '立即领取'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* 分页 */}
            {total > PAGE_SIZE && (
              <div
                style={{
                  marginTop: 32,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <Button
                  size="large"
                  disabled={page <= 1}
                  onClick={() => loadGroups(page - 1)}
                  className="ghost-secondary-btn"
                >
                  ← 上一页
                </Button>
                <Text style={{ fontSize: 15, color: '#6a005f', fontWeight: 600 }}>
                  第 {page} 页 / 共 {Math.ceil(total / PAGE_SIZE)} 页
                </Text>
                <Button
                  size="large"
                  disabled={page >= Math.ceil(total / PAGE_SIZE)}
                  onClick={() => loadGroups(page + 1)}
                  className="ghost-secondary-btn"
                >
                  下一页 →
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
