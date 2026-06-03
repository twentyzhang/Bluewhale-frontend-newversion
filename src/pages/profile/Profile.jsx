import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
import { getMe, updateProfile } from '../../api/user';
import { saveAuth } from '../../utils/auth';

const { Title } = Typography;

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
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Card>
      <Title level={4} style={{ marginTop: 0 }}>
        个人信息
      </Title>
      <Descriptions column={1} bordered size="small" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="用户 ID">{user?.id}</Descriptions.Item>
        <Descriptions.Item label="手机号">{user?.phone}</Descriptions.Item>
        <Descriptions.Item label="身份">
          {ROLE_LABELS[user?.role] || user?.role}
        </Descriptions.Item>
        {user?.role === 'STAFF' && (
          <Descriptions.Item label="所属门店 ID">
            {user?.storeId ?? '—'}
          </Descriptions.Item>
        )}
      </Descriptions>
      <Title level={5}>修改昵称</Title>
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400 }}>
        <Form.Item
          name="nickname"
          label="昵称"
          rules={[{ required: true, message: '请输入昵称' }]}
        >
          <Input placeholder="新昵称" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存
          </Button>
        </Form.Item>
      </Form>
      <div style={{ marginTop: 16 }}>
        <Link to="/profile/password">修改密码 →</Link>
      </div>
    </Card>
  );
}

export default Profile;
