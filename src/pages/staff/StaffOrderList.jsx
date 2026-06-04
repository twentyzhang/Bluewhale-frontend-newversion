import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Pagination,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { listStoreOrders } from '../../api/order';
import StaffStoreGuard from '../../components/StaffStoreGuard';
import { useStaffStoreId } from '../../hooks/useStaffStore';
import { formatPrice } from '../../utils/format';
import { getOrderStatusMeta, ORDER_STATUS_TABS } from '../../utils/orderStatus';

const { Title } = Typography;

function StaffOrderList() {
  const storeId = useStaffStoreId();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const loadOrders = useCallback(
    async (current = 1, filterStatus = status) => {
      if (!storeId) return;
      setLoading(true);
      try {
        const params = { page: current, size: pageSize };
        if (filterStatus) params.status = filterStatus;
        const data = await listStoreOrders(storeId, params);
        setRecords(data.records || []);
        setTotal(data.total ?? 0);
        setPage(data.current ?? current);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    },
    [storeId, status],
  );

  useEffect(() => {
    loadOrders(1, status);
  }, [status, loadOrders]);

  const handleTabChange = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key) next.set('status', key);
    else next.delete('status');
    setSearchParams(next);
  };

  const columns = [
    { title: '订单号', dataIndex: 'id', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => {
        const meta = getOrderStatusMeta(s);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    { title: '商品数', dataIndex: 'itemCount', width: 80 },
    {
      title: '应付金额',
      dataIndex: 'payableAmount',
      width: 120,
      render: formatPrice,
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (t) => t?.replace('T', ' '),
    },
    {
      title: '操作',
      width: 120,
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/staff/orders/${record.id}`)}>
          {record.status === 'PAID' ? '去发货' : '详情'}
        </Button>
      ),
    },
  ];

  return (
    <StaffStoreGuard>
      <Title level={3} style={{ marginTop: 0, marginBottom: 16 }}>
        门店订单
      </Title>
      <Card>
        <Tabs activeKey={status} items={ORDER_STATUS_TABS} onChange={handleTabChange} />
        <Spin spinning={loading}>
          {records.length === 0 && !loading ? (
            <Empty description="暂无订单" />
          ) : (
            <>
              <Table rowKey="id" columns={columns} dataSource={records} pagination={false} />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger={false}
                  onChange={(p) => loadOrders(p, status)}
                />
              </div>
            </>
          )}
        </Spin>
      </Card>
    </StaffStoreGuard>
  );
}

export default StaffOrderList;
