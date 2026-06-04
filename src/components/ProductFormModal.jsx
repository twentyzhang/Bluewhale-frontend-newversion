import { useEffect, useState } from 'react';
import { Cascader, Form, Input, InputNumber, Modal } from 'antd';
import { findCategoryPath, getCategoryTree, toCascaderOptions } from '../api/category';

function ProductFormModal({
  open,
  title,
  initialValues,
  confirmLoading,
  onCancel,
  onSubmit,
  mode,
}) {
  const [form] = Form.useForm();
  const [categoryTree, setCategoryTree] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const isEdit = mode === 'edit';

  useEffect(() => {
    getCategoryTree()
      .then((tree) => {
        const data = Array.isArray(tree) ? tree : [];
        setCategoryTree(data);
        setCategoryOptions(toCascaderOptions(data));
      })
      .catch(() => {
        setCategoryTree([]);
        setCategoryOptions([]);
      });
  }, []);

  useEffect(() => {
    if (open) {
      const next = { ...initialValues };
      if (initialValues?.categoryId && categoryTree.length) {
        next.categoryPath = findCategoryPath(categoryTree, initialValues.categoryId) || undefined;
      }
      form.setFieldsValue(next);
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form, categoryTree]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const payload = { ...values };
    if (values.categoryPath?.length) {
      payload.categoryId = values.categoryPath[values.categoryPath.length - 1];
    }
    delete payload.categoryPath;
    onSubmit(payload);
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="商品名称"
          rules={[{ required: true, message: '请输入商品名称' }]}
        >
          <Input placeholder="商品名称" />
        </Form.Item>
        <Form.Item
          name="price"
          label="价格（元）"
          rules={[{ required: true, message: '请输入价格' }]}
        >
          <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        {!isEdit && (
          <Form.Item
            name="stock"
            label="初始库存"
            rules={[{ required: true, message: '请输入库存' }]}
          >
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        )}
        <Form.Item name="categoryPath" label="分类">
          <Cascader
            options={categoryOptions}
            placeholder="选择分类"
            allowClear
            changeOnSelect
            expandTrigger="hover"
          />
        </Form.Item>
        <Form.Item name="imageUrl" label="图片 URL">
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ProductFormModal;
