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
    
    // Calculate totals
    const subtotal = data.line_items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discountAmount = data.discount_type === 'percentage' 
      ? (subtotal * (data.discount_value || 0) / 100)
      : (data.discount_value || 0);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (data.tax_rate || 0) / 100;
    const total = afterDiscount + taxAmount;
    
    const newInvoice: Invoice = {
      id: String(mockInvoices.length + 1),
      invoice_number: invoiceNumber,
      client_id: data.client_id,
      issue_date: data.issue_date,
      due_date: data.due_date,
      payment_terms: data.payment_terms,
      status: 'draft',
      subtotal: Number(subtotal.toFixed(2)),
      tax_rate: data.tax_rate || 0,
      tax_amount: Number(taxAmount.toFixed(2)),
      discount_type: data.discount_type || undefined,
      discount_value: data.discount_value || undefined,
      discount_amount: Number(discountAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
      notes: data.notes || '',
      client: mockClients.find(c => c.id === data.client_id) || mockClients[0],
      line_items: data.line_items.map((item, idx) => ({
        id: String(idx + 1),
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
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
    
    const invoice = mockInvoices[index];
    
    // Update status if provided
    if (data.status) {
      invoice.status = data.status;
    }
    
    // Update other fields
    if (data.client_id) invoice.client_id = data.client_id;
    if (data.issue_date) invoice.issue_date = data.issue_date;
    if (data.due_date) invoice.due_date = data.due_date;
    if (data.payment_terms) invoice.payment_terms = data.payment_terms;
    if (data.tax_rate !== undefined) invoice.tax_rate = data.tax_rate;
    if (data.discount_type !== undefined) invoice.discount_type = data.discount_type;
    if (data.discount_value !== undefined) invoice.discount_value = data.discount_value;
    if (data.notes !== undefined) invoice.notes = data.notes;
    
    // Update line items if provided
    if (data.line_items) {
      invoice.line_items = data.line_items.map((item, idx) => ({
        id: String(idx + 1),
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
        created_at: new Date().toISOString(),
      }));
      
      // Recalculate totals
      const subtotal = invoice.line_items.reduce((sum, item) => sum + item.amount, 0);
      const discountAmount = invoice.discount_type === 'percentage'
        ? (subtotal * (invoice.discount_value || 0) / 100)
        : (invoice.discount_value || 0);
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = afterDiscount * invoice.tax_rate / 100;
      const total = afterDiscount + taxAmount;
      
      invoice.subtotal = Number(subtotal.toFixed(2));
      invoice.discount_amount = Number(discountAmount.toFixed(2));
      invoice.tax_amount = Number(taxAmount.toFixed(2));
      invoice.total = Number(total.toFixed(2));
    }
    
    invoice.updated_at = new Date().toISOString();
    return invoice;
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockInvoices.findIndex(inv => inv.id === id);
    if (index === -1) throw new Error('Invoice not found');
    mockInvoices.splice(index, 1);
  },
};

