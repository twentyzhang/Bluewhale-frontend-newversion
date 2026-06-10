import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Empty,
  List,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import { claimChatSession, getChatMessages, listChatSessions, releaseChatSession } from '../../api/chat';
import ChatPanel from '../../components/ChatPanel';
import StaffStoreGuard from '../../components/StaffStoreGuard';
import { useChatStomp } from '../../hooks/useChatStomp';
import { useStaffStoreId } from '../../hooks/useStaffStore';
import { getAuth } from '../../utils/auth';
import { mergeMessages } from '../../utils/chatMessages';
import '../../styles/chat.css';

const { Title, Text } = Typography;

function StaffChat() {
  const storeId = useStaffStoreId();
  const { userId } = getAuth();

  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((item) => item.sessionId === activeSessionId),
    [sessions, activeSessionId],
  );

  const isMine = activeSession?.assigneeStaffId === Number(userId);
  const isPending = activeSession && activeSession.assigneeStaffId == null;
  const isTakenByOther =
    activeSession?.assigneeStaffId != null && activeSession.assigneeStaffId !== Number(userId);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await listChatSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

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
      loadSessions();
    },
    [activeSessionId, loadSessions],
  );

  const handleStoreEvent = useCallback(() => {
    loadSessions();
  }, [loadSessions]);

  const { sendStaffMessage } = useChatStomp({
    enabled: !!storeId,
    role: 'STAFF',
    storeId,
    onMessage: handleWsMessage,
    onStoreEvent: handleStoreEvent,
  });

  const handleClaim = async () => {
    if (!activeSessionId) return;
    setActionLoading(true);
    try {
      await claimChatSession(activeSessionId);
      message.success('已接入会话');
      await loadSessions();
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!activeSessionId) return;
    setActionLoading(true);
    try {
      await releaseChatSession(activeSessionId);
      message.success('已释放会话');
      await loadSessions();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = (content) => {
    if (!activeSessionId || !isMine) return;
    sendStaffMessage(activeSessionId, content);
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

  const renderSessionTag = (session) => {
    if (session.assigneeStaffId == null) {
      return <Tag color="orange">待接入</Tag>;
    }
    if (session.assigneeStaffId === Number(userId)) {
      return <Tag color="green">我接待</Tag>;
    }
    return <Tag>他人接待</Tag>;
  };

  return (
    <StaffStoreGuard>
      <Title level={3} style={{ marginTop: 0 }}>
        <MessageOutlined /> 在线客服
      </Title>
      <div className="chat-layout">
        <Card title="店铺会话" className="chat-sidebar" size="small">
          <Spin spinning={sessionsLoading}>
            {sessions.length === 0 ? (
              <Empty description="暂无买家咨询" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                size="small"
                dataSource={sessions}
                renderItem={(item) => (
                  <List.Item
                    className={`chat-session-item${item.sessionId === activeSessionId ? ' chat-session-item-active' : ''}`}
                    onClick={() => setActiveSessionId(item.sessionId)}
                  >
                    <List.Item.Meta
                      title={item.customerNickname}
                      description={
                        <Text type="secondary" ellipsis>
                          {item.lastMessage || '暂无消息'}
                        </Text>
                      }
                    />
                    <Space direction="vertical" align="end" size={4}>
                      {renderSessionTag(item)}
                      {item.customerOnline ? (
                        <Badge status="success" text="在线" />
                      ) : (
                        <Badge status="default" text="离线" />
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
          title={activeSession?.customerNickname || '选择会话'}
          extra={
            activeSession && (
              <Space>
                {isPending && (
                  <Button type="primary" size="small" loading={actionLoading} onClick={handleClaim}>
                    接入
                  </Button>
                )}
                {isMine && (
                  <Button size="small" loading={actionLoading} onClick={handleRelease}>
                    释放
                  </Button>
                )}
                {isTakenByOther && (
                  <Text type="secondary">已由 {activeSession.assigneeNickname || '其他客服'} 接待</Text>
                )}
              </Space>
            )
          }
        >
          <ChatPanel
            messages={messages}
            loading={messagesLoading && !!activeSessionId}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onSend={handleSend}
            sendDisabled={!activeSessionId || !isMine}
            sendPlaceholder={isMine ? '输入回复，Enter 发送' : '请先接入会话后再回复'}
            emptyDescription={activeSessionId ? '暂无消息' : '从左侧选择会话'}
          />
        </Card>
      </div>
    </StaffStoreGuard>
  );
}

export default StaffChat;
