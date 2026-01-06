// Frontend-only demo: Using mock API services
// This version doesn't require a backend - all data is mocked locally
import { mockAuthService, mockClientService, mockInvoiceService } from './mockApi';

export const authService = mockAuthService;
export const clientService = mockClientService;
export const invoiceService = mockInvoiceService;
