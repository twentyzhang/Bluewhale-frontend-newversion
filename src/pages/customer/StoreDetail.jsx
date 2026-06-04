import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Card,
  Col,
  Empty,
  Image,
  Pagination,
  Row,
  Spin,
  Typography,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { getStoreDetail, listStoreProducts } from '../../api/store';
import ProductCard from '../../components/ProductCard';
import ProductFilterBar from '../../components/ProductFilterBar';
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
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: store.name },
        ]}
      />
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <Image
            src={store.logo || PLACEHOLDER}
            alt={store.name}
            width={80}
            height={80}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            fallback={PLACEHOLDER}
            preview={false}
          />
          <div>
            <Title level={3} style={{ marginTop: 0, marginBottom: 8 }}>
              {store.name}
            </Title>
            {store.creditCode && (
              <Text type="secondary">统一社会信用代码：{store.creditCode}</Text>
            )}
          </div>
        </div>
      </Card>
      <Card title="店内商品" style={{ marginBottom: 16 }}>
        <ProductFilterBar onSearch={handleSearch} initialValues={filters} loading={productsLoading} />
      </Card>
      <Spin spinning={productsLoading}>
        {products.length === 0 && !productsLoading ? (
          <Empty description="暂无商品" />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {products.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 24, textAlign: 'center' }}>
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
