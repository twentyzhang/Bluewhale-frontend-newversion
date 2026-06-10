import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Image,
  Pagination,
  Row,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { HomeOutlined, MessageOutlined } from '@ant-design/icons';
import { getStoreDetail, listStoreProducts } from '../../api/store';
import ProductCard from '../../components/ProductCard';
import ProductFilterBar from '../../components/ProductFilterBar';
import { getAuth, isLoggedIn } from '../../utils/auth';
import '../../styles/browse.css';

const { Title, Text } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect fill="#f0f0f0" width="120" height="120"/></svg>',
  );

const PAGE_SIZE = 12;

function StoreDetail() {
  const { storeId } = useParams();
  const [storeLoading, setStoreLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStoreLoading(true);
      try {
        const data = await getStoreDetail(storeId);
        if (!cancelled) setStore(data);
      } catch {
        if (!cancelled) setStore(null);
      } finally {
        if (!cancelled) setStoreLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeId]);

  useEffect(() => {
    setPage(1);
    setFilters({});
  }, [storeId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProductsLoading(true);
      try {
        const data = await listStoreProducts(storeId, {
          page,
          size: PAGE_SIZE,
          ...filters,
        });
        if (!cancelled) {
          setProducts(data.records || []);
          setTotal(data.total ?? 0);
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeId, page, filters]);

  const handleSearch = (params) => {
    setFilters(params);
    setPage(1);
  };

  if (storeLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!store) {
    return <Empty description="商店不存在" />;
  }

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: store.name },
        ]}
      />
      <Card className="store-detail-hero-card" styles={{ body: { padding: 28 } }}>
        <div className="store-detail-hero-body">
          <Image
            src={store.logo || PLACEHOLDER}
            alt={store.name}
            width={120}
            height={120}
            className="store-detail-logo"
            style={{ borderRadius: 16, objectFit: 'cover' }}
            fallback={PLACEHOLDER}
            preview={false}
          />
          <div className="store-detail-info">
            <Title level={3} className="store-detail-title">
              {store.name}
            </Title>
            {store.creditCode && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                统一社会信用代码：
                <Tag color="default" style={{ marginLeft: 6, marginRight: 0 }}>
                  {store.creditCode}
                </Tag>
              </Text>
            )}
          </div>
          {isLoggedIn() && getAuth().role === 'CUSTOMER' && (
            <Link to={`/chat/${store.id}`}>
              <Button
                type="primary"
                size="large"
                icon={<MessageOutlined />}
                className="product-detail-action-btn product-detail-primary-btn"
              >
                联系客服
              </Button>
            </Link>
          )}
        </div>
      </Card>

      <Card
        styles={{
          header: {
            background: 'linear-gradient(135deg, rgba(106,0,95,0.04), rgba(212,177,6,0.04))',
            borderBottom: '1px solid rgba(106,0,95,0.08)',
          },
          body: { padding: 20 },
        }}
        title={
          <span style={{ color: 'var(--brand-700)', fontWeight: 700 }}>店内商品</span>
        }
        style={{ marginBottom: 20, borderRadius: 'var(--radius-lg)', border: '1px solid rgba(106,0,95,0.08)' }}
      >
        <ProductFilterBar onSearch={handleSearch} initialValues={filters} loading={productsLoading} />
      </Card>

      <Spin spinning={productsLoading}>
        {products.length === 0 && !productsLoading ? (
          <Empty description="暂无商品" />
        ) : (
          <>
            <Row gutter={[16, 20]}>
              {products.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                showSizeChanger={false}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </Spin>
    </div>
  );
}

export default StoreDetail;
