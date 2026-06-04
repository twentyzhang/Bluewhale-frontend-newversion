import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Empty, Spin, Tree, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createCategory, getCategoryTree } from '../../api/category';
import CategoryFormModal from '../../components/CategoryFormModal';
import StaffStoreGuard from '../../components/StaffStoreGuard';

const { Title, Text } = Typography;

function buildTreeData(nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node) => ({
    key: String(node.id),
    title: (
      <span>
        {node.name}{' '}
        <Text type="secondary" style={{ fontSize: 12 }}>
          ID: {node.id}
        </Text>
      </span>
    ),
    children: node.children?.length ? buildTreeData(node.children) : undefined,
  }));
}

function StaffCategoryList() {
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const treeData = buildTreeData(tree);

  return (
    <StaffStoreGuard>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            分类管理
          </Title>
          <Text type="secondary">Staff 可新建分类；删除分类需管理员操作</Text>
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
    </StaffStoreGuard>
  );
}

export default StaffCategoryList;
