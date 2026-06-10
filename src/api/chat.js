import request from './request';

export function listChatSessions() {
  return request.get('/chat/sessions');
}

export function getChatMessages(sessionId, params) {
  return request.get(`/chat/sessions/${sessionId}/messages`, { params });
}

export function claimChatSession(sessionId) {
  return request.post(`/chat/sessions/${sessionId}/claim`, {});
}

export function releaseChatSession(sessionId) {
  return request.post(`/chat/sessions/${sessionId}/release`, {});
}
