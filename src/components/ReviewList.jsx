import { useState } from 'react';
import { Button, Input, List, Rate, Space, Typography, message } from 'antd';
import { MessageOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

function ReviewList({ reviews, canReply, replyLoading, onReply }) {
  const [replyingId, setReplyingId] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  if (!reviews?.length) {
    return <Text type="secondary">暂无评论</Text>;
  }

  const startReply = (reviewId) => {
    setReplyingId(reviewId);
    setReplyContent('');
  };

  const cancelReply = () => {
    setReplyingId(null);
    setReplyContent('');
  };

  const submitReply = async (reviewId) => {
    const content = replyContent.trim();
    if (!content) {
      message.warning('请输入回复内容');
      return;
    }
    await onReply(reviewId, content);
    cancelReply();
  };

  return (
    <List
      itemLayout="vertical"
      dataSource={reviews}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <List.Item.Meta
            title={
              <SpaceBetween>
                <Text strong>{item.userNickname || '用户'}</Text>
                <Rate disabled allowHalf value={item.rating} style={{ fontSize: 14 }} />
              </SpaceBetween>
            }
            description={item.createdAt?.replace('T', ' ')}
          />
          <Paragraph style={{ marginBottom: 8 }}>{item.content}</Paragraph>
          {item.replies?.length > 0 && (
            <div className="review-replies">
              {item.replies.map((reply) => (
                <div key={reply.id} className="review-reply-item">
                  <Text strong>{reply.userNickname || '用户'}：</Text>
                  <Text>{reply.content}</Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {reply.createdAt?.replace('T', ' ')}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          )}
          {canReply && (
            <div style={{ marginTop: 8 }}>
              {replyingId === item.id ? (
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Input.TextArea
                    rows={2}
                    placeholder="写下你的回复"
                    value={replyContent}
                    maxLength={500}
                    showCount
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      loading={replyLoading}
                      onClick={() => submitReply(item.id)}
                    >
                      发送
                    </Button>
                    <Button size="small" onClick={cancelReply}>
                      取消
                    </Button>
                  </Space>
                </Space>
              ) : (
                <Button
                  type="link"
                  size="small"
                  icon={<MessageOutlined />}
                  onClick={() => startReply(item.id)}
                >
                  回复
                </Button>
              )}
            </div>
          )}
        </List.Item>
      )}
    />
  );
}

function SpaceBetween({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {children}
    </div>
  );
}

export default ReviewList;
