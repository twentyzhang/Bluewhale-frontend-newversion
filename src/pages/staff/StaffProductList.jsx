import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Image,
  Pagination,
  Popconfirm,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  createStoreProduct,
  deleteStoreProduct,
  updateStoreProduct,
  updateStoreProductStock,
} from '../../api/product';
import { listStoreProducts } from '../../api/store';
import ProductFormModal from '../../components/ProductFormModal';
import StaffStoreGuard from '../../components/StaffStoreGuard';
import StockFormModal from '../../components/StockFormModal';
import { useStaffStoreId } from '../../hooks/useStaffStore';
import { formatPrice } from '../../utils/format';

const { Title } = Typography;
const PAGE_SIZE = 10;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect fill="#f0f0f0" width="48" height="48"/></svg>',
  );

function StaffProductList() {
  const storeId = useStaffStoreId();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockSubmitting, setStockSubmitting] = useState(false);

  const loadProducts = useCallback(
    async (current = 1) => {
      if (!storeId) return;
      setLoading(true);
      try {
        const data = await listStoreProducts(storeId, { page: current, size: PAGE_SIZE });
        setRecords(data.records || []);
        setTotal(data.total ?? 0);
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
    loadProducts(1);
  }, [loadProducts]);

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
        await updateStoreProduct(storeId, editing.id, values);
        message.success('商品已更新');
      } else {
        await createStoreProduct(storeId, values);
        message.success('商品已创建');
      }
      setModalOpen(false);
      await loadProducts(page);
    } catch {
      // 错误已提示
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await deleteStoreProduct(storeId, productId);
      message.success('商品已删除');
      await loadProducts(page);
    } catch {
      // 错误已提示
    }
  };

  const openStock = (record) => {
    setStockProduct(record);
    setStockOpen(true);
  };

  const handleStockSubmit = async (values) => {
    setStockSubmitting(true);
    try {
      const result = await updateStoreProductStock(storeId, stockProduct.id, values);
      message.success(`库存已更新，当前 ${result.currentStock} 件`);
      setStockOpen(false);
      await loadProducts(page);
    } catch {
      // 错误已提示
    } finally {
      setStockSubmitting(false);
    }
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'imageUrl',
      width: 72,
      render: (url, record) => (
        <Image
          src={url || PLACEHOLDER}
          alt={record.name}
          width={48}
          height={48}
          style={{ borderRadius: 8, objectFit: 'cover' }}
          fallback={PLACEHOLDER}
          preview={!!url}
        />
      ),
    },
    { title: 'ID', dataIndex: 'id', width: 72 },
    { title: '名称', dataIndex: 'name' },
    { title: '分类', dataIndex: 'categoryName', width: 120, render: (v) => v || '—' },
    { title: '价格', dataIndex: 'price', width: 100, render: formatPrice },
    { title: '库存', dataIndex: 'stock', width: 80 },
    {
      title: '操作',
      width: 220,
      render: (_, record) => (
        <Space wrap size="small">
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => openStock(record)}>
            库存
          </Button>
          <Popconfirm title="确定删除该商品？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <StaffStoreGuard>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>
          商品管理
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建商品
        </Button>
      </div>
      <Card>
        <Spin spinning={loading}>
          {records.length === 0 && !loading ? (
            <Empty description="暂无商品">
              <Button type="primary" onClick={openCreate}>
                上架第一件商品
              </Button>
            </Empty>
          ) : (
            <>
              <Table rowKey="id" columns={columns} dataSource={records} pagination={false} />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Pagination
                  current={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  showSizeChanger={false}
                  onChange={(p) => loadProducts(p)}
                />
              </div>
            </>
          )}
        </Spin>
      </Card>
      <ProductFormModal
        open={modalOpen}
        mode={modalMode}
        title={modalMode === 'edit' ? '编辑商品' : '新建商品'}
        initialValues={editing || {}}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
      <StockFormModal
        open={stockOpen}
        productName={stockProduct?.name}
        currentStock={stockProduct?.stock}
        confirmLoading={stockSubmitting}
        onCancel={() => setStockOpen(false)}
        onSubmit={handleStockSubmit}
      />
    </StaffStoreGuard>
  );
}

export default StaffProductList;
