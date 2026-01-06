import { CreateLineItemDTO, CreateInvoiceDTO } from '../types';

/**
 * Calculate subtotal from line items
 */
export const calculateSubtotal = (lineItems: CreateLineItemDTO[]): number => {
  return lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.rate;
  }, 0);
};

/**
 * Apply discount to amount
 */
export const applyDiscount = (
  amount: number,
  discountType?: 'percentage' | 'fixed',
  discountValue?: number
): number => {
  if (!discountType || !discountValue) {
    return 0;
  }

  if (discountType === 'percentage') {
    return (amount * discountValue) / 100;
  }

  return discountValue;
};

/**
 * Calculate tax on amount
 */
export const calculateTax = (amount: number, taxRate: number): number => {
  return (amount * taxRate) / 100;
};

/**
 * Calculate total invoice amount
 */
export const calculateTotal = (
  subtotal: number,
  taxRate: number,
  discountType?: 'percentage' | 'fixed',
  discountValue?: number
): {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
} => {
  const discountAmount = applyDiscount(subtotal, discountType, discountValue);
  const amountAfterDiscount = subtotal - discountAmount;
  const taxAmount = calculateTax(amountAfterDiscount, taxRate);
  const total = amountAfterDiscount + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
};

/**
 * Calculate invoice totals from DTO
 */
export const calculateInvoiceTotals = (invoiceData: CreateInvoiceDTO) => {
  const subtotal = calculateSubtotal(invoiceData.line_items);
  const { discountAmount, taxAmount, total } = calculateTotal(
    subtotal,
    invoiceData.tax_rate,
    invoiceData.discount_type,
    invoiceData.discount_value
  );

  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
};

