import { useEffect } from 'react';
import { Form, Input, Modal, Rate, Select } from 'antd';

function ReviewFormModal({
  open,
  eligibleOrders,
  confirmLoading,
  onCancel,
  onSubmit,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        orderId: eligibleOrders.length === 1 ? eligibleOrders[0].id : undefined,
        rating: 5,
        content: '',
      });
    } else {
      form.resetFields();
    }
  }, [open, eligibleOrders, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit(values);
  };

  return (
    <Modal
      title="发表评价"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="orderId"
          label="关联订单"
          rules={[{ required: true, message: '请选择订单' }]}
        >
          <Select
            placeholder="选择已完成且含该商品的订单"
            options={eligibleOrders.map((order) => ({
              value: order.id,
              label: `订单 ${order.id} · ${order.createdAt?.replace('T', ' ')}`,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="rating"
          label="评分"
          rules={[{ required: true, message: '请选择评分' }]}
        >
          <Rate />
        </Form.Item>
        <Form.Item
          name="content"
          label="评价内容"
          rules={[
            { required: true, message: '请输入评价内容' },
            { max: 500, message: '评价内容不超过 500 字' },
          ]}
        >
          <Input.TextArea rows={4} placeholder="分享你的使用感受" showCount maxLength={500} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ReviewFormModal;
