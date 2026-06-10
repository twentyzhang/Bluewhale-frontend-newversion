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
    <Link to={`/stores/${store.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <Card
        hoverable
        styles={{
          body: {
            padding: '20px 22px',
          },
        }}
        style={{
          borderRadius: 14,
          border: '1px solid rgba(106,0,95,0.08)',
          boxShadow: '0 2px 8px rgba(106,0,95,0.04)',
          transition: 'all 0.25s ease',
          background: '#fff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(106,0,95,0.15)';
          e.currentTarget.style.border = '1px solid transparent';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(106,0,95,0.04)';
          e.currentTarget.style.border = '1px solid rgba(106,0,95,0.08)';
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              width: 72,
              height: 72,
              flexShrink: 0,
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(106,0,95,0.12)',
              background: 'linear-gradient(135deg, rgba(106,0,95,0.08), rgba(212,177,6,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src={store.logo || PLACEHOLDER}
              alt={store.name}
              fallback={PLACEHOLDER}
              preview={false}
              width={72}
              height={72}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Paragraph
              strong
              ellipsis={{ rows: 2 }}
              style={{
                marginBottom: 8,
                color: '#1f1f1f',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 0.3,
                lineHeight: 1.4,
              }}
            >
              {store.name}
            </Paragraph>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShopOutlined style={{ color: '#9b4d94', fontSize: 14 }} />
              <Text style={{ color: '#595959', fontSize: 13, fontWeight: 500 }}>
                {store.productCount ?? 0} 件商品
              </Text>
            </div>
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6a005f, #d4b106)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(106,0,95,0.2)',
            }}
          >
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>→</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default StoreCard;
