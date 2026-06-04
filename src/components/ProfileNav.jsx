import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import { getAuth } from '../utils/auth';

function ProfileNav({ activeKey }) {
  const { role } = getAuth();

  const items = [
    { key: 'profile', label: <Link to="/profile">个人信息</Link> },
    { key: 'password', label: <Link to="/profile/password">修改密码</Link> },
  ];

  if (role === 'CUSTOMER') {
    items.push({
      key: 'addresses',
      label: <Link to="/profile/addresses">收货地址</Link>,
    });
  }

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[activeKey]}
      items={items}
      style={{ marginBottom: 24, borderBottom: '1px solid #f0f0f0' }}
    />
  );
}

export default ProfileNav;
