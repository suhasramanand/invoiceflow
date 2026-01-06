import React from 'react';
import { List, ListItem, ListItemText, Chip, Box } from '@mui/material';
import { Invoice } from '../types';
import { format, parseISO } from 'date-fns';

interface RecentActivityProps {
  invoices: Invoice[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ invoices }) => {
  const recentInvoices = [...invoices]
    .sort((a, b) => {
      const dateA = parseISO(a.updated_at);
      const dateB = parseISO(b.updated_at);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 10);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      draft: 'default',
      sent: 'info',
      viewed: 'warning',
      paid: 'success',
      overdue: 'error',
    };
    return colors[status] || 'default';
  };

  if (recentInvoices.length === 0) {
    return <Box>No recent activity</Box>;
  }

  return (
    <List>
      {recentInvoices.map((invoice) => (
        <ListItem key={invoice.id} divider>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={2}>
                <span>{invoice.invoice_number}</span>
                <Chip
                  label={invoice.status}
                  size="small"
                  color={getStatusColor(invoice.status)}
                />
              </Box>
            }
            secondary={
              <>
                {invoice.client?.name || 'Unknown Client'} - ${Number(invoice.total).toFixed(2)} -{' '}
                {format(parseISO(invoice.updated_at), 'MMM d, yyyy')}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default RecentActivity;

