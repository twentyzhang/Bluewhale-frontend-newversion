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
  createStoreCouponGroup,
  deleteCouponGroup,
  listCouponGroups,
} from '../../api/coupon';
import CouponGroupFormModal from '../../components/CouponGroupFormModal';
import StaffStoreGuard from '../../components/StaffStoreGuard';
import { useStaffStoreId } from '../../hooks/useStaffStore';
import { formatCouponValue } from '../../utils/format';
import { formatCouponType } from '../../utils/couponStatus';

const { Title, Text } = Typography;
const PAGE_SIZE = 10;

function StaffCouponList() {
  const storeId = useStaffStoreId();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadGroups = useCallback(
    async (current = 1) => {
      if (!storeId) return;
      setLoading(true);
      try {
        const data = await listCouponGroups({ page: current, size: PAGE_SIZE });
        const storeGroups = (data.records || []).filter(
          (item) => String(item.storeId) === String(storeId),
        );
        setRecords(storeGroups);
        setTotal(data.total ?? storeGroups.length);
        setPage(data.current ?? current);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    },
    [storeId],
  );

  useEffect(() => {
    loadGroups(1);
  }, [loadGroups]);

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      await createStoreCouponGroup(storeId, values);
      message.success('店铺优惠券已发布');
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
      render: (val) => `满 ${Number(val).toFixed(2)} 元`,
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
      render: (_, record) => (
        <Popconfirm title="确定删除该券组？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger loading={deletingId === record.id}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <StaffStoreGuard>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            店铺优惠券
          </Title>
          <Text type="secondary">仅管理本店发布的优惠券</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          发布优惠券
        </Button>
      </div>
      <Card>
        <Spin spinning={loading}>
          {records.length === 0 && !loading ? (
            <Empty description="暂无店铺优惠券">
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
        title="发布店铺优惠券"
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </StaffStoreGuard>
  );
}

export default StaffCouponList;
