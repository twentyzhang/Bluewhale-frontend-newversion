import { useEffect } from 'react';
import { Form, InputNumber, Modal, Select } from 'antd';

const TYPE_OPTIONS = [
  { value: 'IN', label: '入库（增加库存）' },
  { value: 'OUT', label: '出库（减少库存）' },
];

function StockFormModal({ open, productName, currentStock, confirmLoading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ type: 'IN', delta: 1 });
    } else {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      title={`调整库存${productName ? `：${productName}` : ''}`}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
      width={420}
    >
      {currentStock != null && (
        <p style={{ marginTop: 0, color: '#666' }}>当前库存：{currentStock}</p>
      )}
      <Form form={form} layout="vertical">
        <Form.Item
          name="type"
          label="操作类型"
          rules={[{ required: true, message: '请选择类型' }]}
        >
          <Select options={TYPE_OPTIONS} />
        </Form.Item>
        <Form.Item
          name="delta"
          label="数量"
          rules={[{ required: true, message: '请输入数量' }]}
        >
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default StockFormModal;
