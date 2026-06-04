import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Popconfirm,
  Space,
  Spin,
  Tree,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createCategory, deleteCategory, getCategoryTree } from '../../api/category';
import CategoryFormModal from '../../components/CategoryFormModal';

const { Title, Text } = Typography;

function buildTreeData(nodes, onDelete, deletingId) {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => ({
    key: String(node.id),
    title: (
      <Space>
        <span>{node.name}</span>
        <Text type="secondary" style={{ fontSize: 12 }}>
          ID: {node.id}
        </Text>
        <Popconfirm
          title="确定删除该分类？"
          description="存在子分类或关联商品时无法删除"
          onConfirm={() => onDelete(node.id)}
        >
          <Button type="link" size="small" danger loading={deletingId === node.id}>
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
    children: node.children?.length
      ? buildTreeData(node.children, onDelete, deletingId)
      : undefined,
  }));
}

function AdminCategoryList() {
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategoryTree();
      setTree(Array.isArray(data) ? data : []);
    } catch {
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const handleCreate = async (values) => {
    setSubmitting(true);
    try {
      await createCategory(values);
      message.success('分类已创建');
      setModalOpen(false);
      await loadTree();
    } catch {
      // 错误已提示
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    setDeletingId(categoryId);
    try {
      await deleteCategory(categoryId);
      message.success('分类已删除');
      await loadTree();
    } catch {
      // 错误已提示
    } finally {
      setDeletingId(null);
    }
  };

  const treeData = buildTreeData(tree, handleDelete, deletingId);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            分类管理
          </Title>
          <Text type="secondary">支持顶级与子分类；删除仅限管理员</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新建分类
        </Button>
      </div>
      <Card>
        <Spin spinning={loading}>
          {treeData.length === 0 && !loading ? (
            <Empty description="暂无分类">
              <Button type="primary" onClick={() => setModalOpen(true)}>
                创建顶级分类
              </Button>
            </Empty>
          ) : (
            <Tree showLine defaultExpandAll treeData={treeData} />
          )}
        </Spin>
      </Card>
      <CategoryFormModal
        open={modalOpen}
        categoryTree={tree}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

export default AdminCategoryList;
