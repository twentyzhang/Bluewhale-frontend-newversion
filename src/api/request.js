import axios from 'axios';
import { message } from 'antd';
import { refreshTokenApi } from './refresh';
import { clearAuth, getAuth, saveAuth } from '../utils/auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
});

let isRefreshing = false;
const refreshQueue = [];

const AUTH_SKIP_REFRESH_PATHS = ['/auth/login', '/auth/register'];

function isAuthSkipRefreshUrl(url = '') {
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

function isEmptyResponseBody(data) {
  return data === undefined || data === null || data === '';
}

function redirectLogin() {
  clearAuth();
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

function enqueueRefresh(cb) {
  refreshQueue.push(cb);
}

function flushRefreshQueue(token) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue.length = 0;
}

function flushRefreshQueueError(err) {
  refreshQueue.forEach((cb) => cb(null, err));
  refreshQueue.length = 0;
}

async function doRefreshToken() {
  const { userId, refreshToken } = getAuth();
  if (!userId || !refreshToken) {
    throw new Error('NO_REFRESH_TOKEN');
  }
  const data = await refreshTokenApi(Number(userId), refreshToken);
  saveAuth({
    token: data.token,
    refreshToken: data.refreshToken,
  });
  return data.token;
}

async function tryRefreshAndRetry(config) {
  if (!isRefreshing) {
    isRefreshing = true;
    try {
      const newToken = await doRefreshToken();
      isRefreshing = false;
      flushRefreshQueue(newToken);
      config.headers.Authorization = `Bearer ${newToken}`;
      return request(config);
    } catch (err) {
      isRefreshing = false;
      flushRefreshQueueError(err);
      redirectLogin();
      return Promise.reject(err);
    }
  }

  return new Promise((resolve, reject) => {
    enqueueRefresh((token, err) => {
      if (err || !token) {
        reject(err || new Error('登录已过期'));
        return;
      }
      config.headers.Authorization = `Bearer ${token}`;
      resolve(request(config));
    });
  });
}

request.interceptors.request.use(
  (config) => {
    const { token } = getAuth();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

request.interceptors.response.use(
  (resp) => {
    const data = resp.data;
    if (!data || typeof data.code !== 'number') {
      return data;
    }
    const { code, message: msg, data: payload } = data;

    if (code === 200) {
      return payload;
    }

    if (code === 401) {
      if (isAuthSkipRefreshUrl(resp.config?.url)) {
        message.error(msg || '登录失败');
        return Promise.reject(new Error(msg || '登录失败'));
      }
      return tryRefreshAndRetry(resp.config);
    }

    message.error(msg || '请求失败');
    return Promise.reject(new Error(msg || '请求失败'));
  },
  (err) => {
    const { config, response } = err;
    const status = response?.status;
    const body = response?.data;

    if (
      (status === 401 || (status === 403 && isEmptyResponseBody(body))) &&
      config &&
      !isAuthSkipRefreshUrl(config.url)
    ) {
      return tryRefreshAndRetry(config);
    }

    if (body && typeof body.code === 'number' && body.message) {
      message.error(body.message);
    } else if (isAuthSkipRefreshUrl(config?.url)) {
      message.error('登录失败，请检查账号密码');
    } else {
      message.error('网络或服务异常');
      if (status === 401 || (status === 403 && isEmptyResponseBody(body))) {
        redirectLogin();
      }
    }
    return Promise.reject(err);
  },
);

export default request;
