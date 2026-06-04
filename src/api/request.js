import axios from 'axios';
import { message } from 'antd';
import { refreshTokenApi } from './refresh';
import { clearAuth, getAuth, saveAuth, TOKEN_KEY } from '../utils/auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

let isRefreshing = false;
let refreshWaitQueue = [];

const AUTH_SKIP_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

function isAuthSkipRefreshUrl(url = '') {
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

function isEmptyResponseBody(data) {
  return data === undefined || data === null || data === '';
}

function shouldTryRefreshFromHttp(error) {
  const status = error.response?.status;
  const data = error.response?.data;
  if (status === 401) return true;
  if (status === 403 && isEmptyResponseBody(data)) return true;
  return false;
}

function redirectToLogin() {
  clearAuth();
  message.error('登录已过期，请重新登录');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

function enqueueRefresh(callback) {
  refreshWaitQueue.push(callback);
}

function flushRefreshQueue(token) {
  refreshWaitQueue.forEach((cb) => cb(token));
  refreshWaitQueue = [];
}

function flushRefreshQueueError(error) {
  refreshWaitQueue.forEach((cb) => cb(null, error));
  refreshWaitQueue = [];
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
  if (config._authRetried || isAuthSkipRefreshUrl(config.url)) {
    redirectToLogin();
    return Promise.reject(new Error('登录已过期'));
  }
  config._authRetried = true;

  if (!isRefreshing) {
    isRefreshing = true;
    try {
      const newToken = await doRefreshToken();
      isRefreshing = false;
      flushRefreshQueue(newToken);
      config.headers.Authorization = `Bearer ${newToken}`;
      return request(config);
    } catch (error) {
      isRefreshing = false;
      flushRefreshQueueError(error);
      redirectToLogin();
      return Promise.reject(error);
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

function handleBusinessCode(response) {
  const body = response.data;
  if (!body || typeof body.code !== 'number') {
    return body;
  }

  const { code, message: msg, data } = body;

  if (code === 200) {
    return data;
  }

  if (code === 401) {
    if (isAuthSkipRefreshUrl(response.config?.url)) {
      message.error(msg || '登录失败');
      return Promise.reject(new Error(msg || '登录失败'));
    }
    return tryRefreshAndRetry(response.config);
  }

  if (code === 403) {
    message.error(msg || '无权限执行该操作');
    return Promise.reject(new Error(msg || '无权限执行该操作'));
  }

  if (code === 500) {
    message.error(msg || '服务繁忙，请稍后重试');
  } else {
    message.error(msg || '请求失败');
  }
  return Promise.reject(new Error(msg || '请求失败'));
}

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
  (response) => handleBusinessCode(response),
  async (error) => {
    const { config, response } = error;

    if (config && shouldTryRefreshFromHttp(error)) {
      if (isAuthSkipRefreshUrl(config.url)) {
        message.error('登录失败，请检查账号密码');
        return Promise.reject(error);
      }
      return tryRefreshAndRetry(config);
    }

    const body = response?.data;
    if (body && typeof body.code === 'number' && body.message) {
      message.error(body.message);
    } else {
      message.error('网络或服务异常');
    }
    return Promise.reject(error);
  },
);

export default request;
