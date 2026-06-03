import axios from 'axios';
import { message } from 'antd';

const TOKEN_KEY = 'token';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      message.error('登录已过期，请重新登录');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else {
      const msg =
        error.response?.data?.message || error.message || '请求失败';
      message.error(msg);
    }
    return Promise.reject(error);
  },
);

export { TOKEN_KEY };
export default request;
