import { httpClient } from '../http/http-client';

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data: { email: string; password: string })             => httpClient.post('/auth/login/email', data),
  logout:   ()                                                       => httpClient.post('/auth/logout', {}),
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    httpClient.post('/auth/register/email', data),
  getMe:    ()                                                       => httpClient.get('/auth/me'),
};

// ─── Shop ─────────────────────────────────────────────────────────────────
export const shopApi = {
  setup:    (orgId: string, d: any)     => httpClient.post(`/shop/${orgId}/setup`, d),
  getMyShop: (orgId: string)            => httpClient.get(`/shop/${orgId}`),
  update:   (orgId: string, d: any)     => httpClient.patch(`/shop/${orgId}`, d),
  storefront: (slug: string)            => httpClient.get(`/shop/storefront/${slug}`),
};

// ─── Products ─────────────────────────────────────────────────────────────
export const productApi = {
  list:   (orgId: string)               => httpClient.get(`/shop/${orgId}/products`),
  get:    (orgId: string, id: string)   => httpClient.get(`/shop/${orgId}/products/${id}`),
  create: (orgId: string, d: any)       => httpClient.post(`/shop/${orgId}/products`, d),
  update: (orgId: string, id: string, d: any) => httpClient.put(`/shop/${orgId}/products/${id}`, d),
  delete: (orgId: string, id: string)   => httpClient.delete(`/shop/${orgId}/products/${id}`),
};

// ─── Stock ────────────────────────────────────────────────────────────────
export const stockApi = {
  movements: (orgId: string, productId?: string) =>
    httpClient.get(`/shop/${orgId}/stock/movements`, productId ? { productId } : undefined),
  addMovement: (orgId: string, d: { productId: string; type: 'in' | 'out' | 'adjustment'; qty: number; note?: string }) =>
    httpClient.post(`/shop/${orgId}/stock/movements`, d),
  snapshot: (orgId: string) => httpClient.get(`/shop/${orgId}/stock/snapshot`),
};

// ─── Customers ────────────────────────────────────────────────────────────
export const customerApi = {
  list:   (orgId: string, params?: any) => httpClient.get(`/shop/${orgId}/customers`, params),
  get:    (orgId: string, id: string)   => httpClient.get(`/shop/${orgId}/customers/${id}`),
  create: (orgId: string, d: any)       => httpClient.post(`/shop/${orgId}/customers`, d),
  update: (orgId: string, id: string, d: any) => httpClient.put(`/shop/${orgId}/customers/${id}`, d),
  delete: (orgId: string, id: string)   => httpClient.delete(`/shop/${orgId}/customers/${id}`),
};

// ─── Sales ────────────────────────────────────────────────────────────────
export const saleApi = {
  list:   (orgId: string, params?: any) => httpClient.get(`/shop/${orgId}/sales`, params),
  get:    (orgId: string, id: string)   => httpClient.get(`/shop/${orgId}/sales/${id}`),
  create: (orgId: string, d: { items: { productId: string; qty: number }[]; paymentMethod: string; paidAmount: number; customerId?: string; note?: string }) =>
    httpClient.post(`/shop/${orgId}/sales`, d),
  refund: (orgId: string, id: string, d: { reason?: string }) =>
    httpClient.post(`/shop/${orgId}/sales/${id}/refund`, d),
  summary: (orgId: string, params?: { from?: string; to?: string }) =>
    httpClient.get(`/shop/${orgId}/sales/summary`, params),
};

// ─── Expenses ─────────────────────────────────────────────────────────────
export const expenseApi = {
  list:   (orgId: string)               => httpClient.get(`/shop/${orgId}/expenses`),
  create: (orgId: string, d: any)       => httpClient.post(`/shop/${orgId}/expenses`, d),
  update: (orgId: string, id: string, d: any) => httpClient.put(`/shop/${orgId}/expenses/${id}`, d),
  delete: (orgId: string, id: string)   => httpClient.delete(`/shop/${orgId}/expenses/${id}`),
  summary: (orgId: string, params?: any) => httpClient.get(`/shop/${orgId}/expenses/summary`, params),
};

// ─── Devices ──────────────────────────────────────────────────────────────
export const deviceApi = {
  list:     (orgId: string)             => httpClient.get(`/shop/${orgId}/kiosk-devices`),
  create:   (orgId: string, d: any)     => httpClient.post(`/shop/${orgId}/kiosk-devices`, d),
  update:   (orgId: string, id: string, d: any) => httpClient.put(`/shop/${orgId}/kiosk-devices/${id}`, d),
  delete:   (orgId: string, id: string) => httpClient.delete(`/shop/${orgId}/kiosk-devices/${id}`),
  settings: (orgId: string)             => httpClient.get(`/shop/${orgId}/settings/devices`),
};
