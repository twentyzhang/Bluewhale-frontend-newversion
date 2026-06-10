import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  Empty,
  Pagination,
  Row,
  Spin,
  Tabs,
  Typography,
} from 'antd';
import { searchProducts } from '../../api/product';
import { searchStoresByKeyword } from '../../api/store';
import ProductCard from '../../components/ProductCard';
import ProductFilterBar from '../../components/ProductFilterBar';
import StoreCard from '../../components/StoreCard';
import '../../styles/browse.css';

const { Title, Paragraph } = Typography;

const PRODUCT_PAGE_SIZE = 12;
const STORE_PAGE_SIZE = 12;
const ALL_TAB_STORE_PREVIEW = 4;

function parseFiltersFromParams(searchParams) {
  const filters = {};
  const keyword = searchParams.get('keyword');
  const categoryId = searchParams.get('categoryId');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (keyword) filters.keyword = keyword;
  if (categoryId) filters.categoryId = Number(categoryId);
  if (minPrice != null && minPrice !== '') filters.minPrice = Number(minPrice);
  if (maxPrice != null && maxPrice !== '') filters.maxPrice = Number(maxPrice);
  return filters;
}

function filtersToSearchParams(filters, tab) {
  const nextParams = new URLSearchParams();
  if (tab) nextParams.set('tab', tab);
  if (filters.keyword) nextParams.set('keyword', filters.keyword);
  if (filters.categoryId) nextParams.set('categoryId', String(filters.categoryId));
  if (filters.minPrice != null) nextParams.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice != null) nextParams.set('maxPrice', String(filters.maxPrice));
  return nextParams;
}

function SearchProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  const filtersFromUrl = useMemo(() => parseFiltersFromParams(searchParams), [searchParams]);
  const keyword = filtersFromUrl.keyword || '';

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState(filtersFromUrl);
  const [productPage, setProductPage] = useState(1);
  const [storePage, setStorePage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [storeTotal, setStoreTotal] = useState(0);

  useEffect(() => {
    setFilters(filtersFromUrl);
    setProductPage(1);
    setStorePage(1);
  }, [filtersFromUrl]);

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      const data = await searchProducts({
        page: productPage,
        size: PRODUCT_PAGE_SIZE,
        ...filters,
      });
      if (!cancelled) {
        setProducts(data.records || []);
        setProductTotal(data.total ?? 0);
      }
    };

    const loadStores = async () => {
      const size = tab === 'all' ? ALL_TAB_STORE_PREVIEW : STORE_PAGE_SIZE;
      const page = tab === 'all' ? 1 : storePage;
      const data = await searchStoresByKeyword(keyword, { page, size });
      if (!cancelled) {
        setStores(data.records || []);
        setStoreTotal(data.total ?? 0);
      }
    };

    (async () => {
      setLoading(true);
      try {
        const tasks = [];
        if (tab === 'products' || tab === 'all') {
          tasks.push(loadProducts());
        }
        if (tab === 'stores' || tab === 'all') {
          tasks.push(loadStores());
        }
        await Promise.all(tasks);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setStores([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tab, filters, keyword, productPage, storePage]);

  const handleSearch = (params) => {
    setFilters(params);
    setProductPage(1);
    setStorePage(1);
    setSearchParams(filtersToSearchParams(params, tab));
  };

  const handleTabChange = (nextTab) => {
    setProductPage(1);
    setStorePage(1);
    setSearchParams(filtersToSearchParams(filters, nextTab));
  };

  const filterMode = tab === 'stores' ? 'stores' : 'products';
  const showStoreSection = tab === 'all' || tab === 'stores';
  const showProductSection = tab === 'all' || tab === 'products';

  const storeEmptyText = keyword ? '未找到相关商店' : '暂无商店';
  const productEmptyText = keyword ? '未找到相关商品' : '未找到商品';

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'products', label: '商品' },
    { key: 'stores', label: '商店' },
  ];

  return (
    <div>
      <div className="page-hero">
        <Title level={2} className="page-hero-title">
          搜索商品与商店
        </Title>
        <Paragraph className="page-hero-subtitle">
          输入关键词在全平台搜索，快速找到您想要的好物
        </Paragraph>
      </div>
      <Card
        styles={{ body: { padding: 20 } }}
        style={{
          marginBottom: 24,
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(106,0,95,0.08)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Tabs
          activeKey={tab}
          items={tabItems}
          onChange={handleTabChange}
          className="search-tab-bar"
          size="large"
        />
        <div style={{ marginTop: 16 }}>
          <ProductFilterBar
            mode={filterMode}
            keywordPlaceholder="商店或商品名称"
            onSearch={handleSearch}
            initialValues={filters}
            loading={loading}
          />
        </div>
      </Card>
      <Spin spinning={loading}>
        {showStoreSection && (
          <div style={{ marginBottom: tab === 'all' ? 32 : 0 }}>
            {tab === 'all' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <div className="section-title" style={{ marginBottom: 0 }}>
                  <Title level={4} className="section-title-text">
                    相关商店
                  </Title>
                </div>
                {storeTotal > ALL_TAB_STORE_PREVIEW && (
                  <Button type="link" onClick={() => handleTabChange('stores')} style={{ color: 'var(--brand-700)' }}>
                    查看全部 {storeTotal} 家
                  </Button>
                )}
              </div>
            )}
            {stores.length === 0 && !loading ? (
              tab !== 'all' && <Empty description={storeEmptyText} />
            ) : (
              <>
                <Row gutter={[16, 20]}>
                  {stores.map((store) => (
                    <Col key={store.id} xs={24} sm={12} md={8} lg={6}>
                      <StoreCard store={store} />
                    </Col>
                  ))}
                </Row>
                {tab === 'stores' && storeTotal > STORE_PAGE_SIZE && (
                  <div style={{ marginTop: 28, textAlign: 'center' }}>
                    <Pagination
                      current={storePage}
                      pageSize={STORE_PAGE_SIZE}
                      total={storeTotal}
                      showSizeChanger={false}
                      onChange={setStorePage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {showProductSection && (
          <div>
            {tab === 'all' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <div className="section-title" style={{ marginBottom: 0 }}>
                  <Title level={4} className="section-title-text">
                    相关商品
                  </Title>
                </div>
                {productTotal > PRODUCT_PAGE_SIZE && (
                  <Button type="link" onClick={() => handleTabChange('products')} style={{ color: 'var(--brand-700)' }}>
                    查看全部 {productTotal} 件
                  </Button>
                )}
              </div>
            )}
            {products.length === 0 && !loading ? (
              tab !== 'all' ? (
                <Empty description={productEmptyText} />
              ) : (
                stores.length === 0 && <Empty description="未找到相关商店或商品" />
              )
            ) : (
              <>
                <Row gutter={[16, 20]}>
                  {products.map((product) => (
                    <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                      <ProductCard product={product} showStore variant="feed" />
                    </Col>
                  ))}
                </Row>
                {tab === 'products' && productTotal > PRODUCT_PAGE_SIZE && (
                  <div style={{ marginTop: 28, textAlign: 'center' }}>
                    <Pagination
                      current={productPage}
                      pageSize={PRODUCT_PAGE_SIZE}
                      total={productTotal}
                      showSizeChanger={false}
                      onChange={setProductPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Spin>
    </div>
  );
}

export default SearchProducts;
