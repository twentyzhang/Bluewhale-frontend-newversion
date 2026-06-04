const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ID_KEY = 'userId';
const NICKNAME_KEY = 'nickname';
const ROLE_KEY = 'role';
const STORE_ID_KEY = 'storeId';

const AUTH_KEYS = [
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_ID_KEY,
  NICKNAME_KEY,
  ROLE_KEY,
  STORE_ID_KEY,
];

export function saveAuth({
  token,
  refreshToken,
  userId,
  nickname,
  role,
  storeId,
}) {
  if (token != null) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken != null) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (userId != null) localStorage.setItem(USER_ID_KEY, String(userId));
  if (nickname != null) localStorage.setItem(NICKNAME_KEY, nickname);
  if (role != null) localStorage.setItem(ROLE_KEY, role);
  if (storeId !== undefined) {
    if (storeId != null) {
      localStorage.setItem(STORE_ID_KEY, String(storeId));
    } else {
      localStorage.removeItem(STORE_ID_KEY);
    }
  }
}

export function getAuth() {
  const storeId = localStorage.getItem(STORE_ID_KEY);
  return {
    token: localStorage.getItem(TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    userId: localStorage.getItem(USER_ID_KEY),
    nickname: localStorage.getItem(NICKNAME_KEY),
    role: localStorage.getItem(ROLE_KEY),
    storeId: storeId ? Number(storeId) : null,
  };
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function clearAuth() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function getHomePathByRole(role) {
  switch (role) {
    case 'STAFF':
      return '/staff';
    case 'ADMIN':
      return '/admin';
    default:
      return '/';
  }
}

export {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_ID_KEY,
  NICKNAME_KEY,
  ROLE_KEY,
  STORE_ID_KEY,
};
