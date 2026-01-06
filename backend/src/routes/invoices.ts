import { Router } from 'express';
import { body } from 'express-validator';
import { InvoiceController } from '../controllers/invoiceController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

const validateInvoice = [
  body('client_id').notEmpty().withMessage('Client ID is required'),
  body('issue_date').isISO8601().withMessage('Valid issue date is required'),
  body('due_date').isISO8601().withMessage('Valid due date is required'),
  body('payment_terms').trim().notEmpty().withMessage('Payment terms is required'),
  body('tax_rate').isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  body('line_items').isArray({ min: 1 }).withMessage('At least one line item is required'),
  body('line_items.*.description').trim().notEmpty().withMessage('Line item description is required'),
  body('line_items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('line_items.*.rate').isFloat({ min: 0 }).withMessage('Rate must be greater than or equal to 0'),
  body('discount_type').optional().isIn(['percentage', 'fixed']).withMessage('Discount type must be percentage or fixed'),
  body('discount_value').optional().isFloat({ min: 0 }).withMessage('Discount value must be greater than or equal to 0'),
];

const validateInvoiceUpdate = [
  body('client_id').optional().notEmpty().withMessage('Client ID cannot be empty'),
  body('issue_date').optional().isISO8601().withMessage('Valid issue date is required'),
  body('due_date').optional().isISO8601().withMessage('Valid due date is required'),
  body('payment_terms').optional().trim().notEmpty().withMessage('Payment terms cannot be empty'),
  body('tax_rate').optional().isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  body('status').optional().isIn(['draft', 'sent', 'viewed', 'paid', 'overdue']).withMessage('Invalid status'),
  body('line_items').optional().isArray({ min: 1 }).withMessage('At least one line item is required'),
  body('line_items.*.description').optional().trim().notEmpty().withMessage('Line item description is required'),
  body('line_items.*.quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
  body('line_items.*.rate').optional().isFloat({ min: 0 }).withMessage('Rate must be greater than or equal to 0'),
  body('discount_type').optional().isIn(['percentage', 'fixed']).withMessage('Discount type must be percentage or fixed'),
  body('discount_value').optional().isFloat({ min: 0 }).withMessage('Discount value must be greater than or equal to 0'),
];

router.post('/', validateInvoice, InvoiceController.create);
router.get('/', InvoiceController.getAll);
router.get('/:id', InvoiceController.getById);
router.put('/:id', validateInvoiceUpdate, InvoiceController.update);
router.delete('/:id', InvoiceController.delete);

export default router;

