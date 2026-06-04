import { Typography } from 'antd';
import CustomerQuickLinks from '../../components/CustomerQuickLinks';
import StoreList from './StoreList';
import { getAuth } from '../../utils/auth';
import { useCart } from '../../hooks/useCart';
import '../../styles/browse.css';

const { Title, Paragraph } = Typography;

function CustomerHome() {
  const { nickname } = getAuth();
  const { itemCount } = useCart();

  return (
    <div>
      <div className="browse-page-header">
        <Title level={2} style={{ marginTop: 0 }}>
          你好，{nickname || '顾客'}
        </Title>
        <Paragraph type="secondary">欢迎回到南鲸商城，开始探索国货好物</Paragraph>
      </div>
      <CustomerQuickLinks cartCount={itemCount} />
      <StoreList embedded />
    </div>
  );
}

export default CustomerHome;
