import { useCallback, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { message } from 'antd';
import { TOKEN_KEY } from '../utils/auth';

function getWsUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${window.location.host}/ws`;
}

export function useChatStomp({ enabled, role, storeId, onMessage, onStoreEvent }) {
  const clientRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const onStoreEventRef = useRef(onStoreEvent);

  onMessageRef.current = onMessage;
  onStoreEventRef.current = onStoreEvent;

  useEffect(() => {
    if (!enabled) return undefined;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return undefined;

    const client = new Client({
      brokerURL: getWsUrl(),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/messages', (frame) => {
          try {
            onMessageRef.current?.(JSON.parse(frame.body));
          } catch {
            // ignore malformed payload
          }
        });
        client.subscribe('/user/queue/errors', (frame) => {
          try {
            const err = JSON.parse(frame.body);
            message.error(err.message || '消息发送失败');
          } catch {
            message.error('消息发送失败');
          }
        });
        if (role === 'STAFF' && storeId) {
          client.subscribe(`/topic/store.${storeId}`, (frame) => {
            try {
              onStoreEventRef.current?.(JSON.parse(frame.body));
            } catch {
              // ignore
            }
          });
        }
      },
      onStompError: () => {
        message.error('客服连接异常，正在重试…');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled, role, storeId]);

  const sendCustomerMessage = useCallback((targetStoreId, content) => {
    clientRef.current?.publish({
      destination: '/app/chat.customer.send',
      body: JSON.stringify({ storeId: Number(targetStoreId), content }),
    });
  }, []);

  const sendStaffMessage = useCallback((sessionId, content) => {
    clientRef.current?.publish({
      destination: '/app/chat.staff.send',
      body: JSON.stringify({ sessionId: Number(sessionId), content }),
    });
  }, []);

  return { sendCustomerMessage, sendStaffMessage };
}
