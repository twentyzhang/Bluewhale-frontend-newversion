import { Link } from 'react-router-dom';
import { Card, Image, Tag, Typography } from 'antd';
import { formatPrice } from '../utils/format';

const { Text, Paragraph } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f0f0f0" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="14">暂无图片</text></svg>',
  );

function ProductCard({ product }) {
  const outOfStock = product.stock != null && product.stock <= 0;

  return (
    <Link to={`/products/${product.id}`}>
      <Card hoverable className="product-card">
        <Image
          src={product.imageUrl || PLACEHOLDER}
          alt={product.name}
          fallback={PLACEHOLDER}
          preview={false}
          className="product-card-image"
        />
        <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 12, marginBottom: 4 }}>
          {product.name}
        </Paragraph>
        <Text strong style={{ color: '#c41d7f', fontSize: 16 }}>
          {formatPrice(product.price)}
        </Text>
        <div style={{ marginTop: 4 }}>
          {product.categoryName && (
            <Tag style={{ marginRight: 4 }}>{product.categoryName}</Tag>
          )}
          {outOfStock ? (
            <Tag color="default">缺货</Tag>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              库存 {product.stock}
            </Text>
          )}
        </div>
      </Card>
    </Link>
  );
}

export default ProductCard;
