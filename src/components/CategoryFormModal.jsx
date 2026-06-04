import { useEffect } from 'react';
import { Form, Input, Modal, TreeSelect } from 'antd';
import { toCascaderOptions } from '../api/category';

function CategoryFormModal({ open, categoryTree, confirmLoading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const treeData = toCascaderOptions(categoryTree).map((node) => ({
    ...node,
    selectable: true,
  }));

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      name: values.name,
      parentId: values.parentId ?? null,
    });
  };

  return (
    <Modal
      title="新建分类"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
      width={480}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="分类名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        >
          <Input placeholder="如：饮料" />
        </Form.Item>
        <Form.Item name="parentId" label="父分类">
          <TreeSelect
            allowClear
            placeholder="不选则为顶级分类"
            treeData={treeData}
            treeDefaultExpandAll
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CategoryFormModal;
