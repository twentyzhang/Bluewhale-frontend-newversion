import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Select, Typography, message } from 'antd';
import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { register } from '../../api/auth';

const { Title, Text } = Typography;

const PHONE_RULE = { pattern: /^1\d{10}$/, message: '请输入11位手机号' };

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: '顾客' },
  { value: 'STAFF', label: '门店员工' },
];

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await register(values);
      message.success('注册成功，请登录');
      navigate('/login', { replace: true });
    } catch {
      // 错误已在拦截器中提示
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 420 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
          用户注册
        </Title>
        <Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}
        >
          管理员账号由平台创建，不支持自助注册
        </Text>
        <Form
          name="register"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ role: 'CUSTOMER' }}
          autoComplete="off"
        >
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              PHONE_RULE,
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="11位手机号"
              maxLength={11}
            />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="昵称" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, max: 20, message: '密码长度为6-20位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="6-20位密码" />
          </Form.Item>
          <Form.Item
            name="role"
            label="注册身份"
            rules={[{ required: true, message: '请选择身份' }]}
          >
            <Select options={ROLE_OPTIONS} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              注册
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">已有账号？</Text>{' '}
            <Link to="/login">去登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Register;
