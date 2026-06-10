import { useEffect, useState } from 'react';
import { Col, Empty, Pagination, Row, Spin, Typography } from 'antd';
import { listStores } from '../../api/store';
import StoreCard from '../../components/StoreCard';
import '../../styles/browse.css';

const { Title, Paragraph } = Typography;

function StoreList({ embedded = false }) {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 12,
    total: 0,
  });

  const loadStores = async (page = 1) => {
    setLoading(true);
    try {
      const data = await listStores({ page, size: pagination.size });
      setRecords(data.records || []);
      setPagination({
        current: data.current ?? page,
        size: data.size ?? pagination.size,
        total: data.total ?? 0,
      });
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅挂载
  }, []);

  return (
    <div>
      {!embedded && (
        <div className="page-hero">
          <Title level={2} className="page-hero-title">
            探索商店
          </Title>
          <Paragraph className="page-hero-subtitle">
            浏览国货品牌门店，发现优质商品。无需登录即可浏览。
          </Paragraph>
        </div>
      )}
      {embedded && (
        <div className="section-title">
          <Title level={4} className="section-title-text">
            探索商店
          </Title>
        </div>
      )}
      <Spin spinning={loading}>
        {records.length === 0 && !loading ? (
          <Empty description="暂无商店" />
        ) : (
          <>
            <Row gutter={[16, 20]}>
              {records.map((store) => (
                <Col key={store.id} xs={24} sm={12} md={8} lg={6}>
                  <StoreCard store={store} />
                </Col>
              ))}
            </Row>
            <div style={{ marginTop: 28, textAlign: 'center' }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.size}
                total={pagination.total}
                showSizeChanger={false}
                onChange={(page) => loadStores(page)}
              />
            </div>
          </>
        )}
      </Spin>
    </div>
  );
}

export default StoreList;
