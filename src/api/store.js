import request from './request';

export function listStores(params) {
  return request.get('/stores', { params });
}

export function listAdminStores(params) {
  return request.get('/admin/stores', { params });
}

export function createStore(data) {
  return request.post('/stores', data);
}

export function updateStore(storeId, data) {
  return request.put(`/stores/${storeId}`, data);
}

export function getStoreDetail(storeId) {
  return request.get(`/stores/${storeId}`);
}

export function listStoreProducts(storeId, params) {
  return request.get(`/stores/${storeId}/products`, { params });
}

/** 后端暂无 keyword 参数，有关键词时在客户端按名称过滤 */
export async function searchStoresByKeyword(keyword, { page = 1, size = 12 } = {}) {
  const trimmed = keyword?.trim()?.toLowerCase();
  if (!trimmed) {
    return listStores({ page, size });
  }

  const allStores = [];
  let currentPage = 1;
  let totalPages = 1;

  while (currentPage <= totalPages) {
    const data = await listStores({ page: currentPage, size: 50 });
    allStores.push(...(data.records || []));
    totalPages = data.pages ?? 1;
    currentPage += 1;
  }

  const filtered = allStores.filter((s) => s.name?.toLowerCase().includes(trimmed));

  const start = (page - 1) * size;
  return {
    records: filtered.slice(start, start + size),
    total: filtered.length,
    current: page,
    size,
    pages: Math.max(1, Math.ceil(filtered.length / size)),
  };
}
