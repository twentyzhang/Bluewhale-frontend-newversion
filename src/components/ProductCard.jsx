import { Link } from 'react-router-dom';
import { Card, Image, Tag, Typography } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import { formatPrice } from '../utils/format';

const { Text, Paragraph } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f0f0f0" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="14">暂无图片</text></svg>',
  );

function ProductCard({ product, showStore = false, variant = 'default' }) {
  const outOfStock = product.stock != null && product.stock <= 0;
  const isFeed = variant === 'feed';

  const cardClassName = `product-card${isFeed ? ' product-card-feed' : ''}${
    outOfStock ? ' product-card-out-of-stock' : ''
  }`;

  return (
    <Card
      hoverable
      className={cardClassName}
      styles={{ body: { padding: isFeed ? 14 : 18 } }}
    >
      <Link to={`/products/${product.id}`} className="product-card-link">
        <div className="product-card-image-wrap">
          <Image
            src={product.imageUrl || PLACEHOLDER}
            alt={product.name}
            fallback={PLACEHOLDER}
            preview={false}
            className="product-card-image"
          />
          <div className="product-card-image-overlay">
            <Paragraph ellipsis={{ rows: 2 }} className="product-card-image-overlay-title">
              {product.name}
            </Paragraph>
          </div>
          {outOfStock && (
            <Tag className="product-card-stock-tag">缺货</Tag>
          )}
        </div>
        <Paragraph
          ellipsis={{ rows: 2 }}
          className="product-card-title"
          style={{ marginBottom: 8, marginTop: isFeed ? 12 : 14 }}
        >
          {product.name}
        </Paragraph>
        <Text strong className="product-card-price">
          {formatPrice(product.price)}
        </Text>
        {!isFeed && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {product.categoryName && (
              <Tag className="product-card-category-tag">{product.categoryName}</Tag>
            )}
            {!outOfStock && (
              <Text type="secondary" className="product-card-stock-info" style={{ fontSize: 12 }}>
                库存 {product.stock}
              </Text>
            )}
          </div>
        )}
      </Link>
      {isFeed && showStore && product.storeName && (
        <div className="product-card-store">
          <ShopOutlined style={{ marginRight: 6, fontSize: 12, color: 'var(--brand-500)' }} />
          {product.storeId ? (
            <Link to={`/stores/${product.storeId}`} className="product-card-store-link">
              {product.storeName}
            </Link>
          ) : (
            <Text type="secondary" className="product-card-store-text">
              {product.storeName}
            </Text>
          )}
        </div>
      )}
    </Card>
  );
}

export default ProductCard;
