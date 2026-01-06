export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  created_at: Date;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue';
  issue_date: Date;
  due_date: Date;
  payment_terms: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  discount_amount: number;
  total: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  line_items?: InvoiceLineItem[];
  client?: Client;
}

export interface InvoiceWithRelations extends Invoice {
  line_items: InvoiceLineItem[];
  client: Client;
}

export interface CreateInvoiceDTO {
  client_id: string;
  issue_date: string;
  due_date: string;
  payment_terms: string;
  tax_rate: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  notes?: string;
  line_items: CreateLineItemDTO[];
}

export interface CreateLineItemDTO {
  description: string;
  quantity: number;
  rate: number;
}

export interface CreateClientDTO {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface UpdateInvoiceDTO extends Partial<CreateInvoiceDTO> {
  status?: Invoice['status'];
}

import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

