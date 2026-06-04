import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Image,
  Pagination,
  Spin,
  Table,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createStore, listAdminStores, updateStore } from '../../api/store';
import StoreFormModal from '../../components/StoreFormModal';

const { Title } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect fill="#f0f0f0" width="48" height="48"/></svg>',
  );

function AdminStoreList() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 10;

  const loadStores = useCallback(async (current = 1) => {
    setLoading(true);
    try {
      const data = await listAdminStores({ page: current, size: pageSize });
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
    loadStores(1);
  }, [loadStores]);

  const openCreate = () => {
    setModalMode('create');
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setModalMode('edit');
    setEditing(record);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      if (modalMode === 'edit' && editing) {
        await updateStore(editing.id, values);
        message.success('商店信息已更新');
      } else {
        await createStore(values);
        message.success('商店创建成功');
      }
      setModalOpen(false);
      await loadStores(page);
    } catch {
      // 错误已提示
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      width: 72,
      render: (logo, record) => (
        <Image
          src={logo || PLACEHOLDER}
          alt={record.name}
          width={48}
          height={48}
          style={{ borderRadius: 8, objectFit: 'cover' }}
          fallback={PLACEHOLDER}
          preview={!!logo}
        />
      ),
    },
    { title: 'ID', dataIndex: 'id', width: 72 },
    { title: '商店名称', dataIndex: 'name' },
    { title: '信用代码', dataIndex: 'creditCode', ellipsis: true },
    { title: '商品数', dataIndex: 'productCount', width: 88 },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => openEdit(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          商店管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          创建商店
        </Button>
      </div>
      <Card>
        <Spin spinning={loading}>
          {records.length === 0 && !loading ? (
            <Empty description="暂无商店">
              <Button type="primary" onClick={openCreate}>
                创建第一家商店
              </Button>
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
                  onChange={(p) => loadStores(p)}
                />
              </div>
            </>
          )}
        </Spin>
      </Card>
      <StoreFormModal
        open={modalOpen}
        mode={modalMode}
        title={modalMode === 'edit' ? '编辑商店' : '创建商店'}
        initialValues={editing || {}}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default AdminStoreList;
