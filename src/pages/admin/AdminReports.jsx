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
  Typography,
  message,
} from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { exportAdminOrderReport, getAdminOrderReport } from '../../api/report';
import { formatPrice } from '../../utils/format';

const { Title, Text } = Typography;

function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadReport = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const query = {};
      if (params.startDate) query.startDate = params.startDate;
      if (params.endDate) query.endDate = params.endDate;
      const data = await getAdminOrderReport(query);
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleSearch = () => {
    if (startDate && endDate && startDate > endDate) {
      message.warning('起始日期不能晚于截止日期');
      return;
    }
    loadReport({ startDate: startDate || undefined, endDate: endDate || undefined });
  };

  const buildDateParams = () => ({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const handleExport = async () => {
    if (startDate && endDate && startDate > endDate) {
      message.warning('起始日期不能晚于截止日期');
      return;
    }
    setExporting(true);
    try {
      await exportAdminOrderReport(buildDateParams());
      message.success('报表已导出');
    } catch {
      // 错误已提示
    } finally {
      setExporting(false);
    }
  };

  const storeColumns = [
    { title: '商店', dataIndex: 'storeName' },
    { title: '商店 ID', dataIndex: 'storeId', width: 100 },
    { title: '订单数', dataIndex: 'orders', width: 100 },
    {
      title: '营收',
      dataIndex: 'revenue',
      width: 120,
      render: formatPrice,
    },
  ];

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

  return (
    <div>
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
            全局汇总报表
          </Title>
          <Text type="secondary">日期格式 yyyy-MM-dd；留空则后端默认近 30 天</Text>
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
          <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
            导出 Excel
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
              <Col xs={24} sm={12}>
                <Card>
                  <Statistic title="总订单数（含各状态）" value={report?.totalOrders ?? 0} />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card>
                  <Statistic
                    title="总营收（已完成）"
                    value={report?.totalRevenue ?? 0}
                    precision={2}
                    prefix="¥"
                  />
                </Card>
              </Col>
            </Row>
            <Card title="各商店统计" style={{ marginBottom: 16 }}>
              <Table
                rowKey="storeId"
                columns={storeColumns}
                dataSource={report?.storeBreakdown || []}
                pagination={false}
                size="small"
              />
            </Card>
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
    </div>
  );
}

export default AdminReports;
