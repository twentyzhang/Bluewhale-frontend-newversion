import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { getStoreOrderReport } from '../../api/report';
import StaffStoreGuard from '../../components/StaffStoreGuard';
import { useStaffStoreId } from '../../hooks/useStaffStore';
import { formatPrice } from '../../utils/format';
import { getOrderStatusMeta } from '../../utils/orderStatus';

const { Title, Text } = Typography;

function StaffReports() {
  const storeId = useStaffStoreId();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReport = useCallback(
    async (params = {}) => {
      if (!storeId) return;
      setLoading(true);
      try {
        const data = await getStoreOrderReport(storeId, params);
        setReport(data);
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    },
    [storeId],
  );

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleSearch = () => {
    if (startDate && endDate && startDate > endDate) {
      message.warning('起始日期不能晚于截止日期');
      return;
    }
    loadReport({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const dailyColumns = [
    { title: '日期', dataIndex: 'date', width: 140 },
    { title: '订单数', dataIndex: 'orders', width: 100 },
    {
      title: '营收',
      dataIndex: 'revenue',
      width: 120,
      render: formatPrice,
    },
  ];

  const statusBreakdown = report?.statusBreakdown || {};
  const statusEntries = Object.entries(statusBreakdown);

  return (
    <StaffStoreGuard>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            门店报表
          </Title>
          <Text type="secondary">日期留空则默认近 30 天</Text>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: 160 }}
          />
          <span>至</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: 160 }}
          />
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
          <Button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              loadReport();
            }}
          >
            重置
          </Button>
        </div>
      </div>
      <Spin spinning={loading}>
        {!report && !loading ? (
          <Empty description="暂无报表数据" />
        ) : (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic title="总订单数" value={report?.totalOrders ?? 0} />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="总营收（已完成）"
                    value={report?.totalRevenue ?? 0}
                    precision={2}
                    prefix="¥"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="客单价"
                    value={report?.averageOrderAmount ?? 0}
                    precision={2}
                    prefix="¥"
                  />
                </Card>
              </Col>
            </Row>
            {statusEntries.length > 0 && (
              <Card title="订单状态分布" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {statusEntries.map(([status, count]) => {
                    const meta = getOrderStatusMeta(status);
                    return (
                      <Tag key={status} color={meta.color}>
                        {meta.label}：{count}
                      </Tag>
                    );
                  })}
                </div>
              </Card>
            )}
            <Card title="每日趋势">
              <Table
                rowKey="date"
                columns={dailyColumns}
                dataSource={report?.dailyRevenue || []}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="small"
              />
            </Card>
          </>
        )}
      </Spin>
    </StaffStoreGuard>
  );
}

export default StaffReports;
