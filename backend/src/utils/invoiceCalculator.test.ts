import {
  calculateSubtotal,
  applyDiscount,
  calculateTax,
  calculateTotal,
  calculateInvoiceTotals,
} from './invoiceCalculator';
import { CreateInvoiceDTO } from '../types';

describe('InvoiceCalculator', () => {
  describe('calculateSubtotal', () => {
    it('calculates subtotal from line items', () => {
      const items = [
        { description: 'Web Design', quantity: 10, rate: 150 },
        { description: 'Hosting', quantity: 1, rate: 99 },
      ];
      expect(calculateSubtotal(items)).toBe(1599);
    });

    it('returns 0 for empty line items', () => {
      expect(calculateSubtotal([])).toBe(0);
    });

    it('handles decimal quantities and rates', () => {
      const items = [
        { description: 'Service', quantity: 2.5, rate: 100.50 },
      ];
      expect(calculateSubtotal(items)).toBe(251.25);
    });
  });

  describe('applyDiscount', () => {
    it('applies percentage discount correctly', () => {
      expect(applyDiscount(1000, 'percentage', 10)).toBe(100);
      expect(applyDiscount(1000, 'percentage', 15)).toBe(150);
    });

    it('applies fixed discount correctly', () => {
      expect(applyDiscount(1000, 'fixed', 50)).toBe(50);
      expect(applyDiscount(1000, 'fixed', 200)).toBe(200);
    });

    it('returns 0 when discount type or value is missing', () => {
      expect(applyDiscount(1000, undefined, 10)).toBe(0);
      expect(applyDiscount(1000, 'percentage', undefined)).toBe(0);
      expect(applyDiscount(1000)).toBe(0);
    });
  });

  describe('calculateTax', () => {
    it('calculates tax correctly', () => {
      expect(calculateTax(1000, 8.5)).toBe(85);
      expect(calculateTax(100, 10)).toBe(10);
    });

    it('handles zero tax rate', () => {
      expect(calculateTax(1000, 0)).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('calculates total with percentage discount and tax', () => {
      const result = calculateTotal(1000, 8.5, 'percentage', 10);
      expect(result.subtotal).toBe(1000);
      expect(result.discountAmount).toBe(100);
      expect(result.taxAmount).toBe(76.5); // (1000 - 100) * 0.085
      expect(result.total).toBe(976.5);
    });

    it('calculates total with fixed discount and tax', () => {
      const result = calculateTotal(1000, 10, 'fixed', 50);
      expect(result.subtotal).toBe(1000);
      expect(result.discountAmount).toBe(50);
      expect(result.taxAmount).toBe(95); // (1000 - 50) * 0.10
      expect(result.total).toBe(1045);
    });

    it('calculates total without discount', () => {
      const result = calculateTotal(1000, 8.5);
      expect(result.subtotal).toBe(1000);
      expect(result.discountAmount).toBe(0);
      expect(result.taxAmount).toBe(85);
      expect(result.total).toBe(1085);
    });
  });

  describe('calculateInvoiceTotals', () => {
    it('calculates all totals from invoice DTO', () => {
      const invoiceData: CreateInvoiceDTO = {
        client_id: 'client-1',
        issue_date: '2024-01-01',
        due_date: '2024-01-31',
        payment_terms: 'Net 30',
        tax_rate: 8.5,
        discount_type: 'percentage',
        discount_value: 10,
        line_items: [
          { description: 'Service 1', quantity: 10, rate: 100 },
          { description: 'Service 2', quantity: 5, rate: 50 },
        ],
      };

      const result = calculateInvoiceTotals(invoiceData);
      expect(result.subtotal).toBe(1250); // (10 * 100) + (5 * 50)
      expect(result.discountAmount).toBe(125); // 10% of 1250
      expect(result.taxAmount).toBe(95.625); // (1250 - 125) * 0.085
      expect(result.total).toBe(1220.625);
    });
  });
});

