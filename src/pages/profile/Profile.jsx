import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Spin,
  Typography,
  message,
} from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { getMe, updateProfile } from '../../api/user';
import ProfileNav from '../../components/ProfileNav';
import { saveAuth } from '../../utils/auth';
import '../../styles/browse.css';

const { Title, Text } = Typography;

const ROLE_LABELS = {
  CUSTOMER: '顾客',
  STAFF: '门店员工',
  ADMIN: '管理员',
};

function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [form] = Form.useForm();

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await getMe();
      setUser(data);
      form.setFieldsValue({ nickname: data.nickname });
      saveAuth({
        userId: data.id,
        nickname: data.nickname,
        role: data.role,
        storeId: data.storeId,
      });
    } catch {
      // 错误已提示
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅挂载时拉取
  }, []);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await updateProfile(values);
      message.success('昵称已更新');
      await loadUser();
    } catch {
      // 错误已提示
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const avatarText = (user?.nickname || user?.phone || 'U').charAt(0).toUpperCase();

  return (
    <div>
      <ProfileNav activeKey="profile" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {/* 用户头像 + 欢迎语 */}
        <Card
          styles={{ body: { padding: '32px 36px' } }}
          style={{
            borderRadius: 16,
            background: 'linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #6a005f, #d4b106) border-box',
            border: '2px solid transparent',
            boxShadow: '0 8px 24px rgba(106,0,95,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6a005f, #9b4d94 55%, #d4b106 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(106,0,95,0.3)',
                flexShrink: 0,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 40, fontWeight: 800, letterSpacing: 1 }}>
                {avatarText}
              </Text>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: '#6a005f',
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                {user?.nickname}
              </Title>
              <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #6a005f, #9b4d94)',
                    color: '#fff',
                    padding: '4px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <UserOutlined style={{ marginRight: 6 }} />
                  {ROLE_LABELS[user?.role] || user?.role}
                </span>
                <span
                  style={{
                    color: '#8c8c8c',
                    fontSize: 13,
                    padding: '4px 12px',
                    background: 'rgba(106,0,95,0.04)',
                    borderRadius: 8,
                  }}
                >
                  ID: {user?.id}
                </span>
              </div>
              <Text style={{ marginTop: 12, color: '#595959', fontSize: 14, display: 'block' }}>
                欢迎回来，{user?.nickname}！您可以在此修改个人信息。
              </Text>
            </div>
          </div>
        </Card>

        {/* 账户信息 */}
        <Card
          styles={{
            header: { borderBottom: '2px solid rgba(106,0,95,0.08)', paddingBottom: 12 },
            body: { padding: '20px 0 0' },
          }}
          style={{
            borderRadius: 16,
            border: '1px solid rgba(106,0,95,0.08)',
            boxShadow: '0 4px 12px rgba(106,0,95,0.06)',
          }}
          title={
            <span style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>账户信息</span>
          }
        >
          <Descriptions
            column={1}
            size="middle"
            labelStyle={{
              color: '#8c8c8c',
              padding: '14px 20px',
              background: 'rgba(106,0,95,0.03)',
              fontWeight: 500,
              width: 160,
            }}
            contentStyle={{ color: '#1f1f1f', padding: '14px 20px', fontWeight: 600 }}
            bordered
            style={{ background: '#fff' }}
          >
            <Descriptions.Item label="用户 ID">{user?.id}</Descriptions.Item>
            <Descriptions.Item label="手机号">{user?.phone}</Descriptions.Item>
            <Descriptions.Item label="身份">
              <span
                style={{
                  color: '#6a005f',
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
            </Descriptions.Item>
            {user?.role === 'STAFF' && (
              <Descriptions.Item label="所属门店 ID">
                {user?.storeId ?? '—'}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 修改昵称 */}
        <Card
          styles={{
            header: { borderBottom: '2px solid rgba(106,0,95,0.08)', paddingBottom: 12 },
            body: { padding: '24px 32px' },
          }}
          style={{
            borderRadius: 16,
            border: '1px solid rgba(106,0,95,0.08)',
            boxShadow: '0 4px 12px rgba(106,0,95,0.06)',
          }}
          title={
            <span style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>
              <EditOutlined style={{ marginRight: 8 }} />
              修改昵称
            </span>
          }
        >
          <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 480 }}>
            <Form.Item
              name="nickname"
              label={<span style={{ color: '#595959', fontWeight: 600 }}>昵称</span>}
              rules={[
                { required: true, message: '请输入昵称' },
                { max: 20, message: '昵称最多 20 个字符' },
              ]}
            >
              <Input
                size="large"
                placeholder="请输入新昵称"
                prefix={<UserOutlined style={{ color: '#9b4d94' }} />}
                style={{
                  height: 44,
                  borderRadius: 10,
                  borderColor: 'rgba(106,0,95,0.15)',
                }}
              />
            </Form.Item>
            <Form.Item style={{ marginTop: 8 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                size="large"
                style={{
                  height: 44,
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: 2,
                  background: 'linear-gradient(135deg, #6a005f, #9b4d94)',
                  border: 'none',
                  borderRadius: 10,
                  boxShadow: '0 4px 12px rgba(106,0,95,0.2)',
                  padding: '0 32px',
                }}
              >
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
