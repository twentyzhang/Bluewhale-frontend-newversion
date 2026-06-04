import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Col, Empty, Pagination, Row, Spin, Typography } from 'antd';
import { searchProducts } from '../../api/product';
import ProductCard from '../../components/ProductCard';
import ProductFilterBar from '../../components/ProductFilterBar';
import '../../styles/browse.css';

const { Title, Paragraph } = Typography;
const PAGE_SIZE = 12;

function SearchProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keywordFromUrl = searchParams.get('keyword') || '';

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setFilters(keywordFromUrl ? { keyword: keywordFromUrl } : {});
    setPage(1);
  }, [keywordFromUrl]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await searchProducts({
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
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, filters]);

  const handleSearch = (params) => {
    setFilters(params);
    setPage(1);
    const nextParams = new URLSearchParams();
    if (params.keyword) nextParams.set('keyword', params.keyword);
    setSearchParams(nextParams);
  };

  return (
    <div>
      <div className="browse-page-header">
        <Title level={2} style={{ marginTop: 0 }}>
          搜索商品
        </Title>
        <Paragraph type="secondary">在全平台范围内搜索国货商品</Paragraph>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <ProductFilterBar
          onSearch={handleSearch}
          initialValues={{ keyword: keywordFromUrl, ...filters }}
          loading={loading}
        />
      </Card>
      <Spin spinning={loading}>
        {products.length === 0 && !loading ? (
          <Empty description="未找到相关商品" />
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

export default SearchProducts;
