// Using mock API for frontend-only demo
import { mockAuthService, mockClientService, mockInvoiceService } from './mockApi';

export const authService = mockAuthService;
export const clientService = mockClientService;
export const invoiceService = mockInvoiceService;

export const clientService = {
  getAll: async (): Promise<Client[]> => {
    const response = await api.get<Client[]>('/clients');
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: CreateClientDTO): Promise<Client> => {
    const response = await api.post<Client>('/clients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateClientDTO>): Promise<Client> => {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};

export const invoiceService = {
  getAll: async (filters?: {
    status?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> => {
    const response = await api.get<Invoice[]>('/invoices', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get<Invoice>(`/invoices/${id}`);
    return response.data;
  },

  create: async (data: CreateInvoiceDTO): Promise<Invoice> => {
    const response = await api.post<Invoice>('/invoices', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateInvoiceDTO & { status?: Invoice['status'] }>): Promise<Invoice> => {
    const response = await api.put<Invoice>(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },
};

export default api;

