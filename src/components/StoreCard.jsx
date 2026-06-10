import { Link } from 'react-router-dom';
import { Card, Image, Typography } from 'antd';
import { ShopOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#9b4d94;stop-opacity:0.2"/><stop offset="100%" style="stop-color:#d4b106;stop-opacity:0.2"/></linearGradient></defs><rect fill="url(#g)" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6a005f" font-size="36" font-weight="bold">店铺</text></svg>',
  );

function StoreCard({ store }) {
  return (
    <Link to={`/stores/${store.id}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
      <Card
        hoverable
        className="store-card"
        bodyStyle={{
          padding: '16px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
        style={{
          borderRadius: 12,
          border: '1px solid rgba(106,0,95,0.08)',
          boxShadow: '0 2px 8px rgba(106,0,95,0.04)',
          transition: 'all 0.25s ease',
          background: '#fff',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            flexShrink: 0,
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(106,0,95,0.1)',
            background: 'linear-gradient(135deg, rgba(106,0,95,0.08), rgba(212,177,6,0.08))',
          }}
        >
          <Image
            src={store.logo || PLACEHOLDER}
            alt={store.name}
            fallback={PLACEHOLDER}
            preview={false}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Paragraph
            strong
            ellipsis={{ rows: 2 }}
            style={{
              marginBottom: 6,
              color: '#1f1f1f',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 0.2,
              lineHeight: 1.4,
            }}
          >
            {store.name}
          </Paragraph>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <ShopOutlined style={{ color: '#9b4d94', fontSize: 12 }} />
            <Text style={{ color: '#666', fontSize: 12 }}>
              {store.productCount ?? 0} 件商品
            </Text>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default StoreCard;
