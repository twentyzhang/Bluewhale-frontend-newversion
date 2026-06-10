import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Empty,
  Image,
  InputNumber,
  Pagination,
  Rate,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { EditOutlined, HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { getProductDetail } from '../../api/product';
import { addCartItem, getCart } from '../../api/cart';
import {
  createProductReview,
  createReviewReply,
  listProductReviews,
} from '../../api/review';
import ReviewFormModal from '../../components/ReviewFormModal';
import ReviewList from '../../components/ReviewList';
import { useCart } from '../../hooks/useCart';
import { formatPrice, formatRating } from '../../utils/format';
import { fetchReviewEligibleOrders, hasUserReviewed } from '../../utils/review';
import { getAuth, isLoggedIn } from '../../utils/auth';
import '../../styles/browse.css';

const { Title, Text } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><rect fill="#f5f5f5" width="320" height="320"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999">暂无图片</text></svg>',
  );

function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshCart } = useCart();
  const { userId, role } = getAuth();
  const isCustomer = isLoggedIn() && role === 'CUSTOMER';

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState({ current: 1, total: 0, size: 10 });
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const loadProduct = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProductDetail(productId);
      setProduct(data);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const loadReviews = useCallback(
    async (page = 1) => {
      setReviewLoading(true);
      try {
        const data = await listProductReviews(productId, { page, size: reviewPage.size });
        const records = data.records || [];
        setReviews(records);
        setReviewPage({
          current: data.current ?? page,
          total: data.total ?? 0,
          size: data.size ?? reviewPage.size,
        });
        if (isCustomer && page === 1) {
          setHasReviewed(hasUserReviewed(records, userId));
        }
      } catch {
        setReviews([]);
      } finally {
        setReviewLoading(false);
      }
    },
    [productId, reviewPage.size, isCustomer, userId],
  );

  const loadEligibleOrders = useCallback(async () => {
    if (!isCustomer) {
      setEligibleOrders([]);
      return;
    }
    setEligibleLoading(true);
    try {
      const orders = await fetchReviewEligibleOrders(productId);
      setEligibleOrders(orders);
    } catch {
      setEligibleOrders([]);
    } finally {
      setEligibleLoading(false);
    }
  }, [isCustomer, productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    loadReviews(1);
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadEligibleOrders();
  }, [loadEligibleOrders]);

  useEffect(() => {
    setQuantity(1);
  }, [productId]);

  useEffect(() => {
    if (searchParams.get('review') === '1' && isCustomer && !hasReviewed && eligibleOrders.length) {
      setReviewFormOpen(true);
      searchParams.delete('review');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, isCustomer, hasReviewed, eligibleOrders.length]);

  const ensureCustomer = () => {
    if (!isLoggedIn()) {
      message.info('请先登录');
      navigate('/login');
      return false;
    }
    if (role !== 'CUSTOMER') {
      message.warning('仅顾客账号可购买');
      return false;
    }
    if (!product?.stock || quantity < 1) return false;
    if (quantity > product.stock) {
      message.warning(`库存不足，最多可购买 ${product.stock} 件`);
      return false;
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!ensureCustomer()) return;
    setAdding(true);
    try {
      await addCartItem({ productId: Number(productId), quantity });
      message.success('已加入购物车');
      await refreshCart();
    } catch {
      // 错误已在拦截器提示
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!ensureCustomer()) return;
    setBuying(true);
    try {
      await addCartItem({ productId: Number(productId), quantity });
      const cartData = await getCart();
      const item = (cartData.items || []).find(
        (entry) => String(entry.productId) === String(productId) && !entry.productName?.includes('下架'),
      );
      if (!item) {
        message.error('加入购物车失败，请重试');
        return;
      }
      await refreshCart();
      navigate('/checkout', { state: { cartItemIds: [item.id] } });
    } catch {
      // 错误已提示
    } finally {
      setBuying(false);
    }
  };

  const openReviewForm = () => {
    if (!isLoggedIn()) {
      message.info('请先登录后再评价');
      navigate('/login');
      return;
    }
    if (role !== 'CUSTOMER') {
      message.warning('仅顾客账号可发表评价');
      return;
    }
    if (hasReviewed) {
      message.info('您已评价过该商品');
      return;
    }
    if (!eligibleOrders.length) {
      message.info('暂无符合条件的已完成订单，购买并确认收货后可评价');
      return;
    }
    setReviewFormOpen(true);
  };

  const handleReviewSubmit = async (values) => {
    setReviewSubmitting(true);
    try {
      await createProductReview(productId, values);
      message.success('评价发表成功');
      setReviewFormOpen(false);
      setHasReviewed(true);
      await loadProduct();
      await loadReviews(1);
    } catch {
      // 错误已提示
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleReply = async (reviewId, content) => {
    setReplySubmitting(true);
    try {
      await createReviewReply(reviewId, { content });
      message.success('回复成功');
      await loadReviews(reviewPage.current);
    } catch {
      // 错误已提示
    } finally {
      setReplySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <Empty description="商品不存在" />;
  }

  const categoryLabel = product.category
    ? [product.category.parentName, product.category.name].filter(Boolean).join(' / ')
    : null;

  const canWriteReview = isCustomer && !hasReviewed && eligibleOrders.length > 0;

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 20 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          product.storeId
            ? { title: <Link to={`/stores/${product.storeId}`}>{product.storeName}</Link> }
            : null,
          { title: product.name },
        ].filter(Boolean)}
      />
      <Card className="product-detail-card" styles={{ body: { padding: 32 } }}>
        <div className="product-detail-layout">
          <div className="product-detail-image-wrap">
            <Image
              src={product.imageUrl || PLACEHOLDER}
              alt={product.name}
              fallback={PLACEHOLDER}
              className="product-detail-image"
              preview={product.imageUrl ? true : false}
            />
          </div>
          <div>
            <Title level={2} className="product-detail-title">
              {product.name}
            </Title>
            <div className="product-detail-price">
              <span className="product-detail-price-symbol">¥</span>
              <span>{formatPrice(product.price).replace(/^¥/, '')}</span>
            </div>
            <Descriptions
              column={1}
              size="small"
              className="product-detail-descriptions"
              style={{ marginBottom: 20 }}
              labelStyle={{ fontWeight: 500 }}
            >
              <Descriptions.Item label="所属商店">
                {product.storeId ? (
                  <Link to={`/stores/${product.storeId}`} style={{ color: 'var(--brand-700)' }}>
                    {product.storeName}
                  </Link>
                ) : (
                  '—'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="分类">{categoryLabel || '未分类'}</Descriptions.Item>
              <Descriptions.Item label="库存">
                {product.stock > 0 ? (
                  <Tag color="success" style={{ margin: 0 }}>
                    {product.stock} 件
                  </Tag>
                ) : (
                  <Tag color="default" style={{ margin: 0 }}>
                    缺货
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="评分">
                {product.averageRating != null ? (
                  <Space size={8}>
                    <Rate disabled allowHalf value={Number(product.averageRating)} />
                    <Text>{formatRating(product.averageRating)}</Text>
                    <Text type="secondary">（{product.reviewCount ?? 0} 条评价）</Text>
                  </Space>
                ) : (
                  <Text type="secondary">暂无评价</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
            <Space size="middle" wrap style={{ marginBottom: 20 }}>
              <span style={{ color: '#595959', fontSize: 14 }}>数量：</span>
              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(val) => setQuantity(val ?? 1)}
              />
            </Space>
            <Space size="middle" wrap>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                disabled={!product.stock}
                loading={adding}
                onClick={handleAddToCart}
                className="product-detail-action-btn product-detail-primary-btn"
              >
                加入购物车
              </Button>
              <Button
                size="large"
                disabled={!product.stock}
                loading={buying}
                onClick={handleBuyNow}
                className="product-detail-action-btn product-detail-gold-btn"
              >
                立即购买
              </Button>
            </Space>
          </div>
        </div>
      </Card>
      <Card
        className="product-detail-review-card"
        styles={{ header: { padding: '16px 24px' }, body: { padding: 24 } }}
        title={
          <span style={{ color: 'var(--brand-700)', fontWeight: 700 }}>
            用户评价（{product.reviewCount ?? 0}）
          </span>
        }
        style={{ marginTop: 24 }}
        extra={
          canWriteReview ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              loading={eligibleLoading}
              onClick={openReviewForm}
              className="product-detail-primary-btn"
            >
              写评价
            </Button>
          ) : isCustomer && hasReviewed ? (
            <Text type="secondary">您已评价</Text>
          ) : null
        }
      >
        <Spin spinning={reviewLoading}>
          <ReviewList
            reviews={reviews}
            canReply={isCustomer}
            replyLoading={replySubmitting}
            onReply={handleReply}
          />
          {reviewPage.total > reviewPage.size && (
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <Pagination
                current={reviewPage.current}
                pageSize={reviewPage.size}
                total={reviewPage.total}
                showSizeChanger={false}
                onChange={(page) => loadReviews(page)}
              />
            </div>
          )}
        </Spin>
      </Card>
      <ReviewFormModal
        open={reviewFormOpen}
        eligibleOrders={eligibleOrders}
        confirmLoading={reviewSubmitting}
        onCancel={() => setReviewFormOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}

export default ProductDetail;
