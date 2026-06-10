import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  PlusOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from '../../api/address';
import AddressFormModal from '../../components/AddressFormModal';
import ProfileNav from '../../components/ProfileNav';
import '../../styles/browse.css';

const { Title, Text } = Typography;

function AddressList() {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setModalLoading(true);
    try {
      if (editing) {
        await updateAddress(editing.id, values);
        message.success('地址已更新');
      } else {
        await createAddress(values);
        message.success('地址已添加');
      }
      setModalOpen(false);
      await loadAddresses();
    } catch {
      // 错误已提示
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(id);
      message.success('地址已删除');
      await loadAddresses();
    } catch {
      // 错误已提示
    }
  };

  return (
    <div>
      <ProfileNav activeKey="addresses" />

      {/* 顶部标题栏 */}
      <div
        className="page-hero"
        style={{
          padding: '28px 32px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Title
            level={3}
            style={{
              margin: 0,
              color: '#fff',
              fontWeight: 800,
              letterSpacing: 1,
            }}
          >
            <EnvironmentOutlined style={{ marginRight: 12 }} />
            收货地址
          </Title>
          <Text
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 14,
              marginTop: 8,
              display: 'block',
            }}
          >
            管理您的收货地址，便捷地完成下单
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={openCreate}
          style={{
            height: 44,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: 1,
            background: 'rgba(255,255,255,0.2)',
            border: '1.5px solid rgba(255,255,255,0.5)',
            color: '#fff',
            borderRadius: 10,
            backdropFilter: 'blur(10px)',
          }}
        >
          新增地址
        </Button>
      </div>

      <Spin spinning={loading}>
        {addresses.length === 0 && !loading ? (
          <Card
            style={{
              borderRadius: 16,
              border: '1px solid rgba(106,0,95,0.08)',
              boxShadow: '0 4px 12px rgba(106,0,95,0.06)',
            }}
          >
            <Empty
              description={
                <span style={{ color: '#6a005f', fontWeight: 600 }}>
                  暂无收货地址
                </span>
              }
              style={{ padding: '60px 0' }}
            >
              <Button
                type="primary"
                size="large"
                onClick={openCreate}
                style={{
                  height: 44,
                  fontSize: 15,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6a005f, #9b4d94)',
                  border: 'none',
                  borderRadius: 10,
                  boxShadow: '0 4px 12px rgba(106,0,95,0.2)',
                  padding: '0 28px',
                }}
              >
                <HomeOutlined /> 添加地址
              </Button>
            </Empty>
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {addresses.map((addr) => {
              const avatarChar = (addr.receiverName || 'A').charAt(0).toUpperCase();
              return (
                <Card
                  key={addr.id}
                  styles={{ body: { padding: '20px 24px' } }}
                  style={{
                    borderRadius: 14,
                    background: addr.isDefault
                      ? 'linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #6a005f, #d4b106) border-box'
                      : '#fff',
                    border: addr.isDefault
                      ? '2px solid transparent'
                      : '1px solid rgba(106,0,95,0.08)',
                    boxShadow: addr.isDefault
                      ? '0 8px 20px rgba(106,0,95,0.12)'
                      : '0 2px 8px rgba(106,0,95,0.04)',
                    transition: 'all 0.2s ease',
                  }}
                  hoverable={!addr.isDefault}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* 首字母头像 */}
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: addr.isDefault
                          ? 'linear-gradient(135deg, #6a005f, #d4b106)'
                          : 'linear-gradient(135deg, #9b4d94, #c9a227)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: addr.isDefault
                          ? '0 6px 14px rgba(106,0,95,0.25)'
                          : '0 4px 10px rgba(106,0,95,0.15)',
                      }}
                    >
                      <Text
                        style={{
                          color: '#fff',
                          fontSize: 22,
                          fontWeight: 800,
                          letterSpacing: 1,
                        }}
                      >
                        {avatarChar}
                      </Text>
                    </div>

                    {/* 地址信息 */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <Space size={12} align="center" wrap style={{ marginBottom: 6 }}>
                        <Text
                          style={{
                            color: '#1f1f1f',
                            fontSize: 17,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                          }}
                        >
                          {addr.receiverName}
                        </Text>
                        <Text style={{ color: '#595959', fontSize: 14, fontWeight: 500 }}>
                          {addr.phone}
                        </Text>
                        {addr.isDefault && (
                          <Tag
                            color="purple"
                            style={{
                              margin: 0,
                              fontSize: 12,
                              fontWeight: 700,
                              padding: '2px 12px',
                              background: 'linear-gradient(135deg, #6a005f, #9b4d94)',
                              border: 'none',
                              borderRadius: 6,
                            }}
                          >
                            默认地址
                          </Tag>
                        )}
                      </Space>
                      <div
                        style={{
                          color: '#595959',
                          fontSize: 14,
                          lineHeight: 1.6,
                          marginTop: 4,
                        }}
                      >
                        <EnvironmentOutlined
                          style={{
                            color: '#9b4d94',
                            marginRight: 6,
                            fontSize: 14,
                          }}
                        />
                        {addr.province} {addr.city} {addr.district}
                      </div>
                      <div
                        style={{
                          color: '#1f1f1f',
                          fontSize: 15,
                          fontWeight: 600,
                          marginTop: 4,
                          paddingLeft: 20,
                        }}
                      >
                        {addr.detail}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <Space size={8} style={{ flexShrink: 0 }}>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(addr)}
                        style={{
                          color: '#6a005f',
                          fontWeight: 600,
                          fontSize: 14,
                          padding: '4px 12px',
                          height: 36,
                          borderRadius: 8,
                          background: 'rgba(106,0,95,0.04)',
                        }}
                      >
                        编辑
                      </Button>
                      <Popconfirm
                        title="确定删除该地址？"
                        okText="确认"
                        cancelText="取消"
                        okButtonProps={{
                          style: {
                            background: 'linear-gradient(135deg, #6a005f, #9b4d94)',
                            border: 'none',
                          },
                        }}
                        onConfirm={() => handleDelete(addr.id)}
                      >
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            padding: '4px 12px',
                            height: 36,
                            borderRadius: 8,
                            background: 'rgba(239,68,68,0.06)',
                          }}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Spin>

      <AddressFormModal
        open={modalOpen}
        title={
          <span style={{ color: '#6a005f', fontWeight: 700, fontSize: 16 }}>
            {editing ? (
              <>
                <EditOutlined style={{ marginRight: 6 }} /> 编辑地址
              </>
            ) : (
              <>
                <PlusOutlined style={{ marginRight: 6 }} /> 新增地址
              </>
            )}
          </span>
        }
        initialValues={editing || {}}
        confirmLoading={modalLoading}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default AddressList;
