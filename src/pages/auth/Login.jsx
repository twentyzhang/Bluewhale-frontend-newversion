import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Input, Typography, message } from 'antd';
import { LockOutlined, MobileOutlined } from '@ant-design/icons';
import { login } from '../../api/auth';
import { getMe } from '../../api/user';
import { saveAuth, getHomePathByRole } from '../../utils/auth';
import { PHONE_RULE } from '../../utils/phone';
import AuthLayout from '../../layouts/AuthLayout';
import '../../styles/auth.css';

const { Text } = Typography;

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await login(values);
      saveAuth({
        token: data.token,
        refreshToken: data.refreshToken,
        userId: data.userId,
        nickname: data.nickname,
        role: data.role,
        storeId: null,
      });
      try {
        const me = await getMe();
        saveAuth({
          token: data.token,
          refreshToken: data.refreshToken,
          userId: me.id,
          nickname: me.nickname,
          role: me.role,
          storeId: me.storeId,
        });
      } catch {
        // 已保存登录响应中的基本信息
      }
      message.success('登录成功');
      navigate(getHomePathByRole(data.role), { replace: true });
    } catch {
      // 错误已在拦截器中提示
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="欢迎回来" subtitle="登录您的账号，开启国货购物之旅">
      <Form
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="phone"
          label="手机号"
          rules={[{ required: true, message: '请输入手机号' }, PHONE_RULE]}
        >
          <Input
            prefix={<MobileOutlined style={{ color: '#9b4d94' }} />}
            placeholder="请输入手机号"
            maxLength={11}
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
        <Form.Item style={{ marginBottom: 16 }}>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form.Item>
        <div className="auth-form-footer">
          <Text type="secondary">还没有账号？</Text>{' '}
          <Link to="/register">立即注册</Link>
        </div>
      </Form>
    </AuthLayout>
  );
}

export default Login;
