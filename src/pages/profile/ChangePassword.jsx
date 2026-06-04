import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileNav from '../../components/ProfileNav';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { changePassword } from '../../api/user';

const { Title } = Typography;

function ChangePassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await changePassword(values);
      message.success('密码修改成功');
      form.resetFields();
      navigate('/profile');
    } catch {
      // 错误已提示
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProfileNav activeKey="password" />
      <Card style={{ maxWidth: 480 }}>
      <Title level={4} style={{ marginTop: 0 }}>
        修改密码
      </Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="oldPassword"
          label="当前密码"
          rules={[{ required: true, message: '请输入当前密码' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, max: 20, message: '密码长度为6-20位' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="6-20位新密码" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            确认修改
          </Button>
        </Form.Item>
      </Form>
      </Card>
    </div>
  );
}

export default ChangePassword;
