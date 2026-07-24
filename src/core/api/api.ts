import { httpClient } from '../http/http-client';

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (data: { email: string; password: string })             => httpClient.post('/auth/login/email', data),
  logout:   ()                                                       => httpClient.post('/auth/logout', {}),
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) =>
    httpClient.post('/auth/register/email', data),
  getMe:    ()                                                       => httpClient.get('/auth/me'),
};

// ─── Organizations ─────────────────────────────────────────────────────────
export const orgApi = {
  create:     (userId: string, data: { name: string; type?: string }) =>
    httpClient.post('/organizations', { userId, creatorUserId: userId, ...data }),
  getPrimary: (userId: string) =>
    httpClient.get(`/organizations/users/${userId}/memberships`),
};

// ─── Shop ─────────────────────────────────────────────────────────────────
export const shopApi = {
  setup:      (orgId: string, d: any) => httpClient.post(`/shop/${orgId}/setup`, d),
  getMyShop:  (orgId: string)         => httpClient.get(`/shop/${orgId}/profile`),
  update:     (orgId: string, d: any) => httpClient.put(`/shop/${orgId}/profile`, d),
  storefront: (slug: string)          => httpClient.get(`/shop/storefront/${slug}`),
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
  add: (orgId: string, d: { productId: string; qty: number; movementType?: string; unitCost?: number; reason?: string }) =>
    httpClient.post(`/shop/${orgId}/stock/add`, d),
  adjust: (orgId: string, d: { productId: string; newQty: number; reason?: string }) =>
    httpClient.patch(`/shop/${orgId}/stock/adjust`, d),
  alerts: (orgId: string) => httpClient.get(`/shop/${orgId}/stock/alerts`),
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

// ─── Finance (nodes / accounts / allocations / plans / revenue) ────────────
export const financeApi = {
  // Nodes
  listNodes:   (orgId: string)                  => httpClient.get(`/shop/${orgId}/finance/nodes`),
  getNode:     (orgId: string, id: string)      => httpClient.get(`/shop/${orgId}/finance/nodes/${id}`),
  createNode:  (orgId: string, d: any)          => httpClient.post(`/shop/${orgId}/finance/nodes`, d),
  updateNode:  (orgId: string, id: string, d: any) => httpClient.put(`/shop/${orgId}/finance/nodes/${id}`, d),
  deleteNode:  (orgId: string, id: string)      => httpClient.delete(`/shop/${orgId}/finance/nodes/${id}`),
  nodeSummary: (orgId: string, id: string)      => httpClient.get(`/shop/${orgId}/finance/nodes/${id}/summary`),
  nodeVariance:(orgId: string, id: string, asOf?: string) =>
    httpClient.get(`/shop/${orgId}/finance/nodes/${id}/variance`, asOf ? { asOf } : undefined),
  overallSummary: (orgId: string) => httpClient.get(`/shop/${orgId}/finance/summary`),

  // Accounts
  listAccounts:  (orgId: string, nodeId: string) => httpClient.get(`/shop/${orgId}/finance/accounts`, { nodeId }),
  createAccount: (orgId: string, d: any)         => httpClient.post(`/shop/${orgId}/finance/accounts`, d),
  updateAccount: (orgId: string, id: string, d: any) => httpClient.put(`/shop/${orgId}/finance/accounts/${id}`, d),
  deleteAccount: (orgId: string, id: string)     => httpClient.delete(`/shop/${orgId}/finance/accounts/${id}`),

  // Revenue
  listRevenue:  (orgId: string, nodeId: string) => httpClient.get(`/shop/${orgId}/finance/revenue`, { nodeId }),
  createRevenue:(orgId: string, d: any)         => httpClient.post(`/shop/${orgId}/finance/revenue`, d),
  deleteRevenue:(orgId: string, id: string)     => httpClient.delete(`/shop/${orgId}/finance/revenue/${id}`),

  // Plans
  listPlans:  (orgId: string, nodeId: string) => httpClient.get(`/shop/${orgId}/finance/plans`, { nodeId }),
  createPlan: (orgId: string, d: any)         => httpClient.post(`/shop/${orgId}/finance/plans`, d),
  deletePlan: (orgId: string, id: string)     => httpClient.delete(`/shop/${orgId}/finance/plans/${id}`),

  // Allocations
  listAllocations:  (orgId: string, nodeId?: string) =>
    httpClient.get(`/shop/${orgId}/finance/allocations`, nodeId ? { nodeId } : undefined),
  createAllocation: (orgId: string, d: any)      => httpClient.post(`/shop/${orgId}/finance/allocations`, d),
  deleteAllocation: (orgId: string, id: string)  => httpClient.delete(`/shop/${orgId}/finance/allocations/${id}`),

  // Expense linking
  linkExpense: (orgId: string, expenseId: string, nodeId: string) =>
    httpClient.post(`/shop/${orgId}/finance/expenses/${expenseId}/link-node`, { nodeId }),
};

// ─── Storage ──────────────────────────────────────────────────────────────
export const storageApi = {
  uploadFile: (orgId: string, file: File, folderPath = 'products') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('organizationId', orgId);
    fd.append('folderPath', folderPath);
    return httpClient.upload('/storage/files/upload', fd);
  },
};
