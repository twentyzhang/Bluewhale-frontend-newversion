import axios from 'axios';

/** 刷新 token 使用独立请求，避免走业务拦截器的 refresh 循环 */
export async function refreshTokenApi(userId, refreshToken) {
  const res = await axios.post('/api/auth/refresh', { userId, refreshToken });
  const body = res.data;
  if (body?.code !== 200) {
    const err = new Error(body?.message || '刷新登录态失败');
    err.code = body?.code;
    throw err;
  }
  return body.data;
}
