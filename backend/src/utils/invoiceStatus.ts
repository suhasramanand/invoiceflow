import { Invoice } from '../types';

/**
 * Check if an invoice should be marked as overdue
 */
export const checkOverdueStatus = (invoice: Invoice): boolean => {
  if (invoice.status === 'paid') {
    return false;
  }

  const dueDate = new Date(invoice.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
};

