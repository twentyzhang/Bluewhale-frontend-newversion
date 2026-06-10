import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Pagination,
  Popconfirm,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  createGlobalCouponGroup,
  deleteCouponGroup,
  listCouponGroups,
} from '../../api/coupon';
import CouponGroupFormModal from '../../components/CouponGroupFormModal';
import { formatCouponValue } from '../../utils/format';
import { formatCouponType, formatCouponMinOrder } from '../../utils/couponStatus';

const { Text, Title } = Typography;
const PAGE_SIZE = 10;

function AdminCouponList() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      await createGlobalCouponGroup(values);
      message.success('全局优惠券已发布');
      setModalOpen(false);
      await loadGroups(page);
    } catch {
      // 错误已提示
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (groupId) => {
    setDeletingId(groupId);
    try {
      await deleteCouponGroup(groupId);
      message.success('优惠券组已删除');
      await loadGroups(page);
    } catch {
      // 错误已提示
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 72 },
    { title: '名称', dataIndex: 'name' },
    {
      title: '范围',
      width: 110,
      render: (_, record) =>
        record.storeId ? (
          <Tag color="blue">{record.storeName || '店铺券'}</Tag>
        ) : (
          <Tag color="purple">全平台</Tag>
        ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (type) => formatCouponType(type),
    },
    {
      title: '力度',
      width: 100,
      render: (_, record) => formatCouponValue(record),
    },
    {
      title: '门槛',
      dataIndex: 'minOrderAmount',
      width: 100,
      render: (_, record) => formatCouponMinOrder(record),
    },
    {
      title: '剩余',
      width: 100,
      render: (_, record) => `${record.remainCount}/${record.totalCount}`,
    },
    {
      title: '有效期至',
      dataIndex: 'expireAt',
      width: 180,
      render: (t) => t?.replace('T', ' '),
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) =>
        record.storeId ? (
          <Typography.Text type="secondary">—</Typography.Text>
        ) : (
          <Popconfirm title="确定删除该券组？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger loading={deletingId === record.id}>
              删除
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            全局优惠券
          </Title>
          <Text type="secondary">发布全平台券；可查看全部券组，仅可删除全平台券</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          发布优惠券
        </Button>
      </div>
      <Card>
        <Spin spinning={loading}>
          {records.length === 0 && !loading ? (
            <Empty description="暂无全局优惠券">
              <Button type="primary" onClick={() => setModalOpen(true)}>
                发布第一张券
              </Button>
            </Empty>
          ) : (
            <>
              <Table rowKey="id" columns={columns} dataSource={records} pagination={false} />
              {total > PAGE_SIZE && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={total}
                    showSizeChanger={false}
                    onChange={(p) => loadGroups(p)}
                  />
                </div>
              )}
            </>
          )}
        </Spin>
      </Card>
      <CouponGroupFormModal
        open={modalOpen}
        title="发布全局优惠券"
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

export default AdminCouponList;
