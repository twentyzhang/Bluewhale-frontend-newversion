import { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';

import { PHONE_RULE } from '../utils/phone';

function StoreFormModal({ open, title, initialValues, confirmLoading, onCancel, onSubmit, mode }) {
  const [form] = Form.useForm();
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || {});
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
          name="name"
          label="商店名称"
          rules={[{ required: true, message: '请输入商店名称' }]}
        >
          <Input placeholder="商店名称" />
        </Form.Item>
        {!isEdit && (
          <>
            <Form.Item
              name="creditCode"
              label="统一社会信用代码"
              rules={[{ required: true, message: '请输入信用代码' }]}
            >
              <Input placeholder="91320100MA1XXXXX" />
            </Form.Item>
            <Form.Item
              name="staffPhone"
              label="店长手机号"
              rules={[
                { required: true, message: '请输入已注册的 Staff 手机号' },
                PHONE_RULE,
              ]}
              extra="须为已注册且角色为 STAFF 的账号"
            >
              <Input placeholder="11位手机号" maxLength={11} />
            </Form.Item>
          </>
        )}
        <Form.Item name="logo" label="Logo URL">
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default StoreFormModal;
