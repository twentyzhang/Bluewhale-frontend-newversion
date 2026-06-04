import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select } from 'antd';

const TYPE_OPTIONS = [
  { value: 'DISCOUNT', label: '折扣券（value 为折扣率，如 0.5 = 五折）' },
  { value: 'AMOUNT_OFF', label: '满减券（value 为减免金额）' },
];

function CouponGroupFormModal({ open, title, confirmLoading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        type: 'AMOUNT_OFF',
        minOrderAmount: 0,
        totalCount: 100,
      });
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
          label="券名称"
          rules={[{ required: true, message: '请输入券名称' }]}
        >
          <Input placeholder="如：新人满减券" />
        </Form.Item>
        <Form.Item
          name="type"
          label="类型"
          rules={[{ required: true, message: '请选择类型' }]}
        >
          <Select options={TYPE_OPTIONS} />
        </Form.Item>
        <Form.Item
          name="value"
          label="面值 / 折扣率"
          rules={[{ required: true, message: '请输入数值' }]}
        >
          <InputNumber min={0.01} step={0.1} style={{ width: '100%' }} placeholder="满减填金额，折扣填 0.5" />
        </Form.Item>
        <Form.Item
          name="minOrderAmount"
          label="最低消费（元）"
          rules={[{ required: true, message: '请输入门槛' }]}
        >
          <InputNumber min={0} precision={2} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="totalCount"
          label="发放总量"
          rules={[{ required: true, message: '请输入数量' }]}
        >
          <InputNumber min={1} precision={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="startAt"
          label="开始时间"
          rules={[{ required: true, message: '请输入开始时间' }]}
          extra="格式：2026-06-01T00:00:00"
        >
          <Input placeholder="2026-06-01T00:00:00" />
        </Form.Item>
        <Form.Item
          name="expireAt"
          label="过期时间"
          rules={[{ required: true, message: '请输入过期时间' }]}
        >
          <Input placeholder="2026-08-31T23:59:59" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CouponGroupFormModal;
