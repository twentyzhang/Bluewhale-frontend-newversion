import { Alert } from 'antd';
import { useStaffStoreId } from '../hooks/useStaffStore';

function StaffStoreGuard({ children }) {
  const storeId = useStaffStoreId();

  if (!storeId) {
    return (
      <Alert
        type="warning"
        showIcon
        message="未绑定门店"
        description="请联系管理员创建商店并绑定您的 Staff 账号后再使用门店工作台。"
      />
    );
  }

  return children;
}

export default StaffStoreGuard;
