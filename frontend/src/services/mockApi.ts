import { Invoice, Client, CreateInvoiceDTO, CreateClientDTO, AuthResponse, LoginDTO, RegisterDTO } from '../types';
import { mockInvoices, mockClients } from '../data/mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    await delay(500);
    return {
      user: {
        id: '1',
        email: data.email,
        name: data.name,
      },
      token: 'mock-jwt-token',
    };
  },

  login: async (data: LoginDTO): Promise<AuthResponse> => {
    await delay(500);
    if (data.email === 'demo@invoiceflow.com' && data.password === 'password123') {
      return {
        user: {
          id: '1',
          email: 'demo@invoiceflow.com',
          name: 'Demo User',
        },
        token: 'mock-jwt-token',
      };
    }
    throw new Error('Invalid credentials');
  },
};

export const mockClientService = {
  getAll: async (): Promise<Client[]> => {
    await delay(300);
    return [...mockClients];
  },

  getById: async (id: string): Promise<Client> => {
    await delay(200);
    const client = mockClients.find(c => c.id === id);
    if (!client) throw new Error('Client not found');
    return client;
  },

  create: async (data: CreateClientDTO): Promise<Client> => {
    await delay(400);
    const newClient: Client = {
      id: String(mockClients.length + 1),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockClients.push(newClient);
    return newClient;
  },

  update: async (id: string, data: Partial<CreateClientDTO>): Promise<Client> => {
    await delay(400);
    const index = mockClients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    mockClients[index] = { ...mockClients[index], ...data, updated_at: new Date().toISOString() };
    return mockClients[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockClients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    mockClients.splice(index, 1);
  },
};

export const mockInvoiceService = {
  getAll: async (filters?: {
    status?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> => {
    await delay(300);
    let filtered = [...mockInvoices];

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(inv => inv.status === filters.status);
    }

    if (filters?.clientId) {
      filtered = filtered.filter(inv => inv.client_id === filters.clientId);
    }

    return filtered;
  },

  getById: async (id: string): Promise<Invoice> => {
    await delay(200);
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  },

  create: async (data: CreateInvoiceDTO): Promise<Invoice> => {
    await delay(500);
    const invoiceNumber = `INV-2026-${String(mockInvoices.length + 1).padStart(4, '0')}`;
    const newInvoice: Invoice = {
      id: String(mockInvoices.length + 1),
      invoice_number: invoiceNumber,
      ...data,
      client: mockClients.find(c => c.id === data.client_id) || mockClients[0],
      status: 'draft',
      subtotal: '0',
      tax_rate: data.tax_rate || 0,
      tax_amount: '0',
      discount_type: data.discount_type || null,
      discount_value: data.discount_value || null,
      discount_amount: '0',
      total: '0',
      notes: data.notes || '',
      line_items: data.line_items.map((item, idx) => ({
        id: String(idx + 1),
        ...item,
        amount: item.quantity * item.rate,
        created_at: new Date().toISOString(),
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockInvoices.push(newInvoice);
    return newInvoice;
  },

  update: async (id: string, data: Partial<CreateInvoiceDTO & { status?: Invoice['status'] }>): Promise<Invoice> => {
    await delay(400);
    const index = mockInvoices.findIndex(inv => inv.id === id);
    if (index === -1) throw new Error('Invoice not found');
    
    if (data.status) {
      mockInvoices[index].status = data.status;
    }
    
    mockInvoices[index] = {
      ...mockInvoices[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return mockInvoices[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockInvoices.findIndex(inv => inv.id === id);
    if (index === -1) throw new Error('Invoice not found');
    mockInvoices.splice(index, 1);
  },
};

