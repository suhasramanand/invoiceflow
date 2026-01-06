import { Response } from 'express';
import { InvoiceModel } from '../models/Invoice';
import { AuthRequest } from '../types';
import { validationResult } from 'express-validator';
import { checkOverdueStatus } from '../utils/invoiceStatus';

export class InvoiceController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const invoice = await InvoiceModel.create(req.user.id, req.body);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const filters = {
        status: req.query.status as string | undefined,
        clientId: req.query.clientId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      let invoices = await InvoiceModel.findByUserId(req.user.id, filters);
      
      // Check and update overdue status for each invoice
      const updatePromises = invoices.map(async (invoice) => {
        if (checkOverdueStatus(invoice) && invoice.status !== 'overdue') {
          // Auto-update to overdue if past due date
          try {
            await InvoiceModel.update(invoice.id, req.user!.id, { status: 'overdue' });
            // Refetch the updated invoice
            const updated = await InvoiceModel.findById(invoice.id, req.user!.id);
            return updated || invoice;
          } catch (error) {
            return invoice;
          }
        }
        return invoice;
      });

      invoices = await Promise.all(updatePromises);
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const invoice = await InvoiceModel.findById(req.params.id, req.user.id);
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const invoice = await InvoiceModel.update(req.params.id, req.user.id, req.body);
      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const deleted = await InvoiceModel.delete(req.params.id, req.user.id);
      if (!deleted) {
        res.status(404).json({ error: 'Invoice not found' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

