import { useEffect, useState } from 'react';
import { Col, Row, Spin, Typography } from 'antd';
import CustomerQuickLinks from '../../components/CustomerQuickLinks';
import ProductFeed from './ProductFeed';
import StoreCard from '../../components/StoreCard';
import { listStores } from '../../api/store';
import { getAuth } from '../../utils/auth';
import { useCart } from '../../hooks/useCart';
import '../../styles/browse.css';

const { Title, Paragraph } = Typography;

function CustomerHome() {
  const { nickname } = getAuth();
  const { itemCount } = useCart();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listStores({ page: 1, size: 8 })
      .then((data) => setStores(data.records || []))
      .catch(() => setStores([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-hero">
        <Title level={2} className="page-hero-title">
          你好，{nickname || '顾客'}，欢迎来到
          <span className="page-hero-gold"> 南鲸商城 · 国货优选</span>
        </Title>
        <Paragraph className="page-hero-subtitle">
          汇聚优质国货品牌门店，精选好物，购物更安心
        </Paragraph>
      </div>
      <CustomerQuickLinks cartCount={itemCount} />
      <div className="customer-home-stores">
        <div className="section-title">
          <Title level={4} className="section-title-text">
            探索商店
          </Title>
        </div>
        <Spin spinning={loading}>
          <Row gutter={[16, 16]} className="customer-home-stores-row">
            {stores.slice(0, 4).map((store) => (
              <Col key={store.id} xs={24} sm={12} md={6}>
                <StoreCard store={store} />
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
      <div className="section-title">
        <Title level={4} className="section-title-text">
          为你推荐
        </Title>
      </div>
      <ProductFeed embedded showStore />
    </div>
  );
}

export default CustomerHome;
