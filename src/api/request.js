import axios from 'axios';
import { message } from 'antd';
import { clearAuth, TOKEN_KEY } from '../utils/auth';

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
  (response) => {
    const body = response.data;
    if (body && typeof body.code === 'number') {
      if (body.code === 200) {
        return body.data;
      }
      message.error(body.message || '请求失败');
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return body;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
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

export default request;
