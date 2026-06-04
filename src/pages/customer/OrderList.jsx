import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Empty,
  Pagination,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { getMyOrders } from '../../api/order';
import { formatPrice } from '../../utils/format';
import { getOrderStatusMeta } from '../../utils/orderStatus';

const { Title } = Typography;

function OrderList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const loadOrders = useCallback(async (current = 1) => {
    setLoading(true);
    try {
      const data = await getMyOrders({ page: current, size: pageSize });
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
    loadOrders(1);
  }, [loadOrders]);

  const columns = [
    { title: '订单号', dataIndex: 'id', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const meta = getOrderStatusMeta(status);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    { title: '商店', dataIndex: 'storeName' },
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
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/orders/${record.id}`)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: '我的订单' },
        ]}
      />
      <Title level={2} style={{ marginTop: 0 }}>
        我的订单
      </Title>
      <Spin spinning={loading}>
        <Card>
          {records.length === 0 && !loading ? (
            <Empty description="暂无订单">
              <Link to="/">去逛逛</Link>
            </Empty>
          ) : (
            <>
              <Table rowKey="id" columns={columns} dataSource={records} pagination={false} />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger={false}
                  onChange={(p) => loadOrders(p)}
                />
              </div>
            </>
          )}
        </Card>
      </Spin>
    </div>
  );
}

export default OrderList;
