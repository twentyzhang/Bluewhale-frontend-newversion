import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Breadcrumb,
  Card,
  Empty,
  List,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import { HomeOutlined, MessageOutlined } from '@ant-design/icons';
import { getChatMessages, listChatSessions } from '../../api/chat';
import { listStores } from '../../api/store';
import ChatPanel from '../../components/ChatPanel';
import { useChatStomp } from '../../hooks/useChatStomp';
import { mergeMessages } from '../../utils/chatMessages';
import '../../styles/chat.css';

const { Title, Text } = Typography;

function CustomerChat() {
  const { storeId: storeIdParam } = useParams();
  const presetStoreId = storeIdParam ? Number(storeIdParam) : null;

  const [sessions, setSessions] = useState([]);
  const [stores, setStores] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeStoreId, setActiveStoreId] = useState(presetStoreId);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((item) => item.sessionId === activeSessionId),
    [sessions, activeSessionId],
  );

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await listChatSessions();
      const list = Array.isArray(data) ? data : [];
      setSessions(list);
      return list;
    } catch {
      setSessions([]);
      return [];
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadStores = useCallback(async () => {
    try {
      const data = await listStores({ page: 1, size: 100 });
      setStores(data.records || []);
    } catch {
      setStores([]);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    (async () => {
      const list = await loadSessions();
      if (presetStoreId) {
        const matched = list.find((item) => item.storeId === presetStoreId);
        if (matched) {
          setActiveSessionId(matched.sessionId);
          setActiveStoreId(matched.storeId);
        } else {
          setActiveStoreId(presetStoreId);
        }
      }
    })();
  }, [loadSessions, presetStoreId]);

  const loadHistory = useCallback(async (sessionId, before) => {
    const data = await getChatMessages(sessionId, { before, size: 20 });
    const batch = Array.isArray(data) ? [...data].reverse() : [];
    setHasMore(batch.length >= 20);
    return batch;
  }, []);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      setHasMore(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setMessagesLoading(true);
      try {
        const batch = await loadHistory(activeSessionId);
        if (!cancelled) setMessages(batch);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeSessionId, loadHistory]);

  const handleWsMessage = useCallback(
    (msg) => {
      if (msg.sessionId === activeSessionId) {
        setMessages((prev) => mergeMessages(prev, msg));
      }
      loadSessions().then((list) => {
        if (!activeSessionId && msg.sessionId) {
          const matched = list.find((item) => item.sessionId === msg.sessionId);
          if (matched) {
            setActiveSessionId(matched.sessionId);
            setActiveStoreId(matched.storeId);
          }
        }
      });
    },
    [activeSessionId, loadSessions],
  );

  const { sendCustomerMessage } = useChatStomp({
    enabled: true,
    role: 'CUSTOMER',
    onMessage: handleWsMessage,
  });

  const handleSelectSession = (sessionId) => {
    const session = sessions.find((item) => item.sessionId === sessionId);
    setActiveSessionId(sessionId);
    setActiveStoreId(session?.storeId ?? null);
  };

  const handleSelectStore = (storeId) => {
    setActiveStoreId(storeId);
    const matched = sessions.find((item) => item.storeId === storeId);
    setActiveSessionId(matched?.sessionId ?? null);
  };

  const handleSend = async (content) => {
    const targetStoreId = activeStoreId ?? activeSession?.storeId;
    if (!targetStoreId) {
      message.warning('请先选择要咨询的商店');
      return;
    }
    sendCustomerMessage(targetStoreId, content);
    setTimeout(() => {
      loadSessions().then((list) => {
        const matched = list.find((item) => item.storeId === targetStoreId);
        if (matched) setActiveSessionId(matched.sessionId);
      });
    }, 400);
  };

  const handleLoadMore = async () => {
    if (!activeSessionId || loadingMore || !hasMore) return;
    const oldestId = messages[0]?.id;
    if (!oldestId) return;
    setLoadingMore(true);
    try {
      const batch = await loadHistory(activeSessionId, oldestId);
      setMessages((prev) => {
        const ids = new Set(prev.map((item) => item.id));
        const unique = batch.filter((item) => !ids.has(item.id));
        return [...unique, ...prev];
      });
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: '在线客服' },
        ]}
      />
      <Title level={2} style={{ marginTop: 0 }}>
        <MessageOutlined /> 在线客服
      </Title>
      <div className="chat-layout">
        <Card title="我的会话" className="chat-sidebar" size="small">
          <Spin spinning={sessionsLoading}>
            {sessions.length === 0 ? (
              <Empty description="暂无会话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                size="small"
                dataSource={sessions}
                renderItem={(item) => (
                  <List.Item
                    className={`chat-session-item${item.sessionId === activeSessionId ? ' chat-session-item-active' : ''}`}
                    onClick={() => handleSelectSession(item.sessionId)}
                  >
                    <List.Item.Meta
                      title={item.storeName}
                      description={
                        <Text type="secondary" ellipsis>
                          {item.lastMessage || '暂无消息'}
                        </Text>
                      }
                    />
                    <Space direction="vertical" align="end" size={4}>
                      {item.staffOnline ? (
                        <Badge status="success" text="客服在线" />
                      ) : (
                        <Badge status="default" text="客服离线" />
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Spin>
        </Card>
        <Card
          className="chat-main"
          size="small"
          title={
            activeSession?.storeName ||
            stores.find((item) => item.id === activeStoreId)?.name ||
            '选择商店开始咨询'
          }
          extra={
            <Select
              placeholder="选择商店"
              style={{ width: 180 }}
              value={activeStoreId ?? undefined}
              onChange={handleSelectStore}
              options={stores.map((store) => ({ value: store.id, label: store.name }))}
            />
          }
        >
          <ChatPanel
            messages={messages}
            loading={messagesLoading && !!activeSessionId}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onSend={handleSend}
            sendDisabled={!activeStoreId && !activeSession?.storeId}
            sendPlaceholder={
              activeStoreId || activeSession?.storeId
                ? '输入消息，Enter 发送'
                : '请先选择商店'
            }
            emptyDescription={
              activeSessionId
                ? '暂无消息，发送第一条开始对话'
                : '选择商店并发送消息，系统将自动创建会话'
            }
          />
        </Card>
      </div>
    </div>
  );
}

export default CustomerChat;
