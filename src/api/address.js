import request from './request';

export function listAddresses() {
  return request.get('/addresses');
}

export function createAddress(data) {
  return request.post('/addresses', data);
}

export function updateAddress(addressId, data) {
  return request.put(`/addresses/${addressId}`, data);
}

export function deleteAddress(addressId) {
  return request.delete(`/addresses/${addressId}`);
}
