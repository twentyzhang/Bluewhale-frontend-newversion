import axios from 'axios';
import { message } from 'antd';
import request from './request';
import { TOKEN_KEY } from '../utils/auth';

export function getAdminOrderReport(params) {
  return request.get('/admin/reports/orders', { params });
}

export function getStoreOrderReport(storeId, params) {
  return request.get(`/stores/${storeId}/reports/orders`, { params });
}

function parseFilename(contentDisposition) {
  if (!contentDisposition) return 'order-report.xlsx';
  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);
  const plainMatch = /filename="?([^";\n]+)"?/i.exec(contentDisposition);
  return plainMatch ? plainMatch[1].trim() : 'order-report.xlsx';
}

function isXlsxResponse(contentType = '') {
  if (contentType.includes('json')) return false;
  return (
    contentType.includes('spreadsheetml') ||
    contentType.includes('application/vnd.ms-excel') ||
    contentType.includes('application/octet-stream')
  );
}

/** 报表导出走独立 blob 请求，不走 JSON 业务拦截器 */
async function downloadReportExport(path, params) {
  const token = localStorage.getItem(TOKEN_KEY);
  const resp = await axios.get(path, {
    baseURL: '/api',
    params,
    responseType: 'blob',
    timeout: 60000,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const contentType = resp.headers['content-type'] || '';
  if (!isXlsxResponse(contentType)) {
    const text = await resp.data.text();
    try {
      const json = JSON.parse(text);
      message.error(json.message || '导出失败');
    } catch {
      message.error('导出失败');
    }
    throw new Error('export failed');
  }

  const filename = parseFilename(resp.headers['content-disposition']);
  const url = URL.createObjectURL(resp.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportAdminOrderReport(params) {
  return downloadReportExport('/admin/reports/orders/export', params);
}

export function exportStoreOrderReport(storeId, params) {
  return downloadReportExport(`/stores/${storeId}/reports/orders/export`, params);
}
