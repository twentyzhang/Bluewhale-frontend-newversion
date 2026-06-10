import { useEffect } from 'react';
import { Form, Input, InputNumber, Modal, Select } from 'antd';

const TYPE_OPTIONS = [
  { value: 'DISCOUNT', label: '折扣券（value 为折扣率，如 0.5 = 五折）' },
  { value: 'FULL_REDUCTION', label: '满减券（有门槛，value 为减免金额）' },
  { value: 'DIRECT_OFF', label: '直减券（无门槛，value 为减免金额）' },
];

function CouponGroupFormModal({ open, title, confirmLoading, onCancel, onSubmit }) {
  const [form] = Form.useForm();
  const couponType = Form.useWatch('type', form);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        type: 'FULL_REDUCTION',
        minOrderAmount: 100,
        totalCount: 100,
      });
    } else {
      form.resetFields();
    }
  }, [open, form]);

  useEffect(() => {
    if (!open || !couponType) return;
    if (couponType === 'DIRECT_OFF') {
      form.setFieldValue('minOrderAmount', 0);
    } else if (couponType === 'FULL_REDUCTION') {
      const current = form.getFieldValue('minOrderAmount');
      if (!current || Number(current) <= 0) {
        form.setFieldValue('minOrderAmount', 100);
      }
    }
  }, [couponType, form, open]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  const minOrderRules = [{ required: true, message: '请输入门槛' }];
  if (couponType === 'FULL_REDUCTION') {
    minOrderRules.push({
      validator: (_, value) =>
        value != null && Number(value) > 0
          ? Promise.resolve()
          : Promise.reject(new Error('满减券门槛必须大于 0')),
    });
  } else if (couponType === 'DIRECT_OFF') {
    minOrderRules.push({
      validator: (_, value) =>
        value == null || Number(value) === 0
          ? Promise.resolve()
          : Promise.reject(new Error('直减券门槛必须为 0')),
    });
  }

  const valueRules = [{ required: true, message: '请输入数值' }];
  if (couponType === 'DISCOUNT') {
    valueRules.push({
      validator: (_, value) =>
        value != null && Number(value) > 0 && Number(value) < 1
          ? Promise.resolve()
          : Promise.reject(new Error('折扣率须大于 0 且小于 1（如 0.5）')),
    });
  } else {
    valueRules.push({
      validator: (_, value) =>
        value != null && Number(value) > 0
          ? Promise.resolve()
          : Promise.reject(new Error('减免金额须大于 0')),
    });
  }

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
        <Form.Item name="value" label="面值 / 折扣率" rules={valueRules}>
          <InputNumber
            min={couponType === 'DISCOUNT' ? 0.01 : 0.01}
            max={couponType === 'DISCOUNT' ? 0.99 : undefined}
            step={couponType === 'DISCOUNT' ? 0.1 : 1}
            style={{ width: '100%' }}
            placeholder={
              couponType === 'DISCOUNT' ? '如 0.5 表示五折' : '减免金额（元）'
            }
          />
        </Form.Item>
        <Form.Item
          name="minOrderAmount"
          label="最低消费（元）"
          rules={minOrderRules}
          extra={
            couponType === 'DIRECT_OFF'
              ? '直减券固定为 0'
              : couponType === 'FULL_REDUCTION'
                ? '满减券须大于 0'
                : '折扣券门槛可选'
          }
        >
          <InputNumber
            min={0}
            precision={2}
            style={{ width: '100%' }}
            disabled={couponType === 'DIRECT_OFF'}
          />
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
