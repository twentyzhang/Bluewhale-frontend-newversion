import { useEffect } from 'react';
import { Form, Input, Modal, Switch } from 'antd';

import { PHONE_RULE } from '../utils/phone';

function AddressFormModal({ open, title, initialValues, confirmLoading, onCancel, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        isDefault: false,
        ...initialValues,
      });
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

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
      width={520}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="receiverName"
          label="收货人"
          rules={[{ required: true, message: '请输入收货人姓名' }]}
        >
          <Input placeholder="收货人姓名" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="手机号"
          rules={[{ required: true, message: '请输入手机号' }, PHONE_RULE]}
        >
          <Input placeholder="11位手机号" maxLength={11} />
        </Form.Item>
        <Form.Item
          name="province"
          label="省份"
          rules={[{ required: true, message: '请输入省份' }]}
        >
          <Input placeholder="如：江苏省" />
        </Form.Item>
        <Form.Item
          name="city"
          label="城市"
          rules={[{ required: true, message: '请输入城市' }]}
        >
          <Input placeholder="如：南京市" />
        </Form.Item>
        <Form.Item
          name="district"
          label="区/县"
          rules={[{ required: true, message: '请输入区/县' }]}
        >
          <Input placeholder="如：鼓楼区" />
        </Form.Item>
        <Form.Item
          name="detail"
          label="详细地址"
          rules={[{ required: true, message: '请输入详细地址' }]}
        >
          <Input.TextArea rows={2} placeholder="街道、门牌号等" />
        </Form.Item>
        <Form.Item name="isDefault" label="设为默认地址" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddressFormModal;
