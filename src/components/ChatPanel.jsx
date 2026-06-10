import { useEffect, useRef } from 'react';
import { Button, Empty, Input, Spin, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { getAuth } from '../utils/auth';

const { Text } = Typography;

function formatTime(value) {
  if (!value) return '';
  return value.replace('T', ' ').slice(0, 16);
}

function ChatPanel({
  messages,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onSend,
  sendDisabled,
  sendPlaceholder = '输入消息…',
  emptyDescription = '暂无消息，发送第一条开始对话',
}) {
  const { userId, role } = getAuth();
  const listRef = useRef(null);
  const stickBottomRef = useRef(true);

  useEffect(() => {
    if (!stickBottomRef.current || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    stickBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (el.scrollTop < 32 && hasMore && !loadingMore) {
      onLoadMore?.();
    }
  };

  const handleSend = (text) => {
    const content = text.trim();
    if (!content) return;
    stickBottomRef.current = true;
    onSend?.(content);
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel-messages" ref={listRef} onScroll={handleScroll}>
        {loadingMore && (
          <div className="chat-panel-load-more">
            <Spin size="small" />
          </div>
        )}
        {loading ? (
          <div className="chat-panel-center">
            <Spin />
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-panel-center">
            <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          messages.map((msg) => {
            const isMine =
              (role === 'CUSTOMER' && msg.senderRole === 'CUSTOMER' && msg.senderId === Number(userId)) ||
              (role === 'STAFF' && msg.senderRole === 'STAFF' && msg.senderId === Number(userId));
            return (
              <div
                key={msg.id ?? `${msg.createdAt}-${msg.content}`}
                className={`chat-bubble-row${isMine ? ' chat-bubble-row-mine' : ''}`}
              >
                <div className={`chat-bubble${isMine ? ' chat-bubble-mine' : ''}`}>
                  <div>{msg.content}</div>
                  <Text type="secondary" className="chat-bubble-time">
                    {formatTime(msg.createdAt)}
                  </Text>
                </div>
              </div>
            );
          })
        )}
      </div>
      <Input.Search
        className="chat-panel-input"
        placeholder={sendPlaceholder}
        enterButton={<Button type="primary" icon={<SendOutlined />} disabled={sendDisabled} />}
        disabled={sendDisabled}
        onSearch={handleSend}
        maxLength={500}
      />
    </div>
  );
}

export default ChatPanel;
