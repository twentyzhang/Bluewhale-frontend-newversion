import { Link } from 'react-router-dom';
import { Card, Image, Typography } from 'antd';
import { ShopOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#f0f0f0" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="14">暂无图片</text></svg>',
  );

function StoreCard({ store }) {
  return (
    <Link to={`/stores/${store.id}`}>
      <Card hoverable className="store-card">
        <div className="store-card-body">
          <Image
            src={store.logo || PLACEHOLDER}
            alt={store.name}
            fallback={PLACEHOLDER}
            preview={false}
            className="store-card-logo"
          />
          <div className="store-card-info">
            <Paragraph strong ellipsis={{ rows: 2 }} style={{ marginBottom: 4 }}>
              {store.name}
            </Paragraph>
            <Text type="secondary">
              <ShopOutlined /> {store.productCount ?? 0} 件商品
            </Text>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default StoreCard;
