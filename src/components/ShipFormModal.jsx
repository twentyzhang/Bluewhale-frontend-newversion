import { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';

function ShipFormModal({ open, confirmLoading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      title="订单发货"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
      width={480}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="carrier"
          label="快递公司"
          rules={[{ required: true, message: '请输入快递公司' }]}
        >
          <Input placeholder="如：顺丰速运" />
        </Form.Item>
        <Form.Item
          name="trackingNumber"
          label="运单号"
          rules={[{ required: true, message: '请输入运单号' }]}
        >
          <Input placeholder="物流单号" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ShipFormModal;
