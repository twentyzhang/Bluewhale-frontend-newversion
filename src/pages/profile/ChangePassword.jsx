import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  message,
} from 'antd';
import {
  LockOutlined,
  UnlockOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import ProfileNav from '../../components/ProfileNav';
import { changePassword } from '../../api/user';
import '../../styles/browse.css';

const { Title, Text } = Typography;

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

      <Card
        styles={{ body: { padding: '40px 48px' } }}
        style={{
          maxWidth: 560,
          margin: '0 auto',
          borderRadius: 16,
          background:
            'linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #6a005f, #d4b106) border-box',
          border: '2px solid transparent',
          boxShadow: '0 10px 28px rgba(106,0,95,0.12)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6a005f, #9b4d94 55%, #d4b106 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 20px rgba(106,0,95,0.25)',
            }}
          >
            <LockOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title
            level={3}
            style={{
              margin: 0,
              color: '#6a005f',
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            修改密码
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: 14, marginTop: 8, display: 'block' }}>
            定期修改密码可以保护您的账户安全
          </Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="oldPassword"
            label={<span style={{ color: '#595959', fontWeight: 600 }}>当前密码</span>}
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password
              size="large"
              placeholder="请输入当前密码"
              prefix={<LockOutlined style={{ color: '#9b4d94' }} />}
              style={{
                height: 44,
                borderRadius: 10,
                borderColor: 'rgba(106,0,95,0.15)',
              }}
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<span style={{ color: '#595959', fontWeight: 600 }}>新密码</span>}
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, max: 20, message: '密码长度为 6-20 位' },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="6-20 位新密码"
              prefix={<UnlockOutlined style={{ color: '#9b4d94' }} />}
              style={{
                height: 44,
                borderRadius: 10,
                borderColor: 'rgba(106,0,95,0.15)',
              }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span style={{ color: '#595959', fontWeight: 600 }}>确认新密码</span>}
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
            <Input.Password
              size="large"
              placeholder="再次输入新密码"
              prefix={<SafetyCertificateOutlined style={{ color: '#9b4d94' }} />}
              style={{
                height: 44,
                borderRadius: 10,
                borderColor: 'rgba(106,0,95,0.15)',
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 3,
                background: 'linear-gradient(135deg, #6a005f 0%, #9b4d94 50%, #d4b106 100%)',
                border: 'none',
                borderRadius: 10,
                boxShadow: '0 6px 18px rgba(106,0,95,0.25)',
              }}
            >
              <LockOutlined /> 确认修改
            </Button>
          </Form.Item>
        </Form>

        <div
          style={{
            marginTop: 24,
            padding: 14,
            background: 'linear-gradient(135deg, rgba(106,0,95,0.04), rgba(212,177,6,0.04))',
            borderRadius: 10,
            border: '1px dashed rgba(106,0,95,0.1)',
          }}
        >
          <Text style={{ color: '#6a005f', fontSize: 13, fontWeight: 600 }}>
            🔐 安全提示
          </Text>
          <div style={{ marginTop: 8, fontSize: 13, color: '#595959', lineHeight: 1.7 }}>
            · 请使用至少 6 位包含字母和数字的强密码<br />
            · 不要在其他网站使用相同的密码<br />
            · 建议每 3-6 个月更换一次密码
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ChangePassword;
