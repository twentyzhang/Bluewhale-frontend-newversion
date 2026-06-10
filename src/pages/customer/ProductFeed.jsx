import { useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Empty, Pagination, Row, Spin, Typography } from 'antd';
import { searchProducts } from '../../api/product';
import { listStores } from '../../api/store';
import ProductCard from '../../components/ProductCard';
import '../../styles/browse.css';

const { Title, Paragraph } = Typography;
const PAGE_SIZE = 12;

function ProductFeed({ embedded = false, showStore = true }) {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [storeNameMap, setStoreNameMap] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!showStore) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await listStores({ page: 1, size: 100 });
        if (cancelled) return;
        const map = {};
        (data.records || []).forEach((store) => {
          map[store.id] = store.name;
        });
        setStoreNameMap(map);
      } catch {
        if (!cancelled) setStoreNameMap({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showStore]);

  const displayProducts = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        storeName:
          product.storeName ||
          (product.storeId != null ? storeNameMap[product.storeId] : undefined),
      })),
    [products, storeNameMap],
  );

  const loadProducts = useCallback(async (current = 1) => {
    setLoading(true);
    try {
      const data = await searchProducts({ page: current, size: PAGE_SIZE });
      setProducts(data.records || []);
      setTotal(data.total ?? 0);
      setPage(data.current ?? current);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(1);
  }, [loadProducts]);

  return (
    <div>
      {!embedded && (
        <div className="page-hero">
          <Title level={2} className="page-hero-title">
            发现好物
          </Title>
          <Paragraph className="page-hero-subtitle">
            精选国货商品，点击图片查看详情
          </Paragraph>
        </div>
      )}
      {embedded && (
        <div className="section-title">
          <Title level={4} className="section-title-text">
            为你推荐
          </Title>
        </div>
      )}
      <Spin spinning={loading}>
        {products.length === 0 && !loading ? (
          <Empty description="暂无商品" />
        ) : (
          <>
            <Row gutter={[16, 20]} style={{ marginTop: embedded ? 0 : 0 }}>
              {displayProducts.map((product) => (
                <Col key={product.id} xs={12} sm={8} md={6} lg={6} xl={4}>
                  <ProductCard product={product} showStore={showStore} variant="feed" />
                </Col>
              ))}
            </Row>
            {total > PAGE_SIZE && (
              <div style={{ marginTop: 28, textAlign: 'center' }}>
                <Pagination
                  current={page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  showSizeChanger={false}
                  onChange={loadProducts}
                />
              </div>
            )}
          </>
        )}
      </Spin>
    </div>
  );
}

export default ProductFeed;
