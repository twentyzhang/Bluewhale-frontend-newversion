import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from '../../api/address';
import AddressFormModal from '../../components/AddressFormModal';
import ProfileNav from '../../components/ProfileNav';
import { formatAddress } from '../../utils/format';

const { Title } = Typography;

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

  const columns = [
    {
      title: '收货人',
      dataIndex: 'receiverName',
      render: (name, record) => (
        <Space>
          {name}
          {record.isDefault && <Tag color="purple">默认</Tag>}
        </Space>
      ),
    },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    {
      title: '地址',
      render: (_, record) => formatAddress(record),
    },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该地址？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProfileNav activeKey="addresses" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          收货地址
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新增地址
        </Button>
      </div>
      <Spin spinning={loading}>
        <Card>
          {addresses.length === 0 && !loading ? (
            <Empty description="暂无收货地址">
              <Button type="primary" onClick={openCreate}>
                添加地址
              </Button>
            </Empty>
          ) : (
            <Table rowKey="id" columns={columns} dataSource={addresses} pagination={false} />
          )}
        </Card>
      </Spin>
      <AddressFormModal
        open={modalOpen}
        title={editing ? '编辑地址' : '新增地址'}
        initialValues={editing || {}}
        confirmLoading={modalLoading}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default AddressList;
