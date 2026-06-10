import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, Typography, message } from 'antd';
import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import { register } from '../../api/auth';
import { PHONE_RULE } from '../../utils/phone';
import AuthLayout from '../../layouts/AuthLayout';
import '../../styles/auth.css';

const { Text } = Typography;

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
    <AuthLayout title="创建账号" subtitle="注册成为南鲸商城用户">
      <Form
        name="register"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ role: 'CUSTOMER' }}
        autoComplete="off"
        size="large"
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
            prefix={<MobileOutlined style={{ color: '#9b4d94' }} />}
            placeholder="请输入手机号"
            maxLength={11}
          />
        </Form.Item>
        <Form.Item
          name="nickname"
          label="昵称"
          rules={[
            { required: true, message: '请输入昵称' },
            { min: 2, max: 20, message: '昵称长度为2-20个字符' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#9b4d94' }} />}
            placeholder="请输入昵称"
            maxLength={20}
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, max: 20, message: '密码长度为6-20位' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#9b4d94' }} />}
            placeholder="请输入密码"
          />
        </Form.Item>
        <Form.Item
          name="role"
          label="注册身份"
          rules={[{ required: true, message: '请选择身份' }]}
        >
          <Select
            options={ROLE_OPTIONS}
            placeholder="请选择身份"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            注册
          </Button>
        </Form.Item>
        <div className="auth-form-footer">
          <Text type="secondary">已有账号？</Text>{' '}
          <Link to="/login">去登录</Link>
        </div>
      </Form>
    </AuthLayout>
  );
}

export default Register;
