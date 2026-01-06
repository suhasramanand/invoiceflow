import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  Receipt,
  Schedule,
} from '@mui/icons-material';
import { invoiceService } from '../services/api';
import { Invoice } from '../types';
import RevenueChart from '../components/RevenueChart';
import PaymentStatusChart from '../components/PaymentStatusChart';
import RecentActivity from '../components/RecentActivity';

const DashboardPage: React.FC = () => {
  const { data: invoices, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: () => invoiceService.getAll(),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load dashboard data. Please try again later.
      </Alert>
    );
  }

  const invoicesData = invoices || [];

  const totalOutstanding = invoicesData
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const paidThisMonth = invoicesData
    .filter((inv) => {
      if (inv.status !== 'paid') return false;
      const paidDate = new Date(inv.updated_at);
      const now = new Date();
      return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inv) => sum + Number(inv.total), 0);

  const overdueCount = invoicesData.filter((inv) => {
    if (inv.status === 'paid') return false;
    const dueDate = new Date(inv.due_date);
    return dueDate < new Date();
  }).length;

  const totalInvoices = invoicesData.length;

  const statCards = [
    {
      title: 'Total Outstanding',
      value: `$${totalOutstanding.toFixed(2)}`,
      icon: <AttachMoney />,
      color: '#000000',
    },
    {
      title: 'Paid This Month',
      value: `$${paidThisMonth.toFixed(2)}`,
      icon: <TrendingUp />,
      color: '#10B981',
    },
    {
      title: 'Total Invoices',
      value: totalInvoices.toString(),
      icon: <Receipt />,
      color: '#6366F1',
    },
    {
      title: 'Overdue',
      value: overdueCount.toString(),
      icon: <Schedule />,
      color: '#EF4444',
    },
  ];

  return (
    <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      color="text.secondary" 
                      gutterBottom 
                      variant="body2"
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        mb: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography 
                      variant="h4" 
                      component="div"
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '2rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      color: card.color,
                      opacity: 0.8,
                      '& svg': {
                        fontSize: '2rem',
                      },
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, height: '400px', border: '1px solid #F3F4F6' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, fontSize: '1.125rem' }}>
              Revenue by Month
            </Typography>
            <RevenueChart invoices={invoicesData} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, height: '400px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, fontSize: '1.125rem' }}>
              Payment Status
            </Typography>
            <Box sx={{ height: 'calc(100% - 60px)' }}>
              <PaymentStatusChart invoices={invoicesData} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 4, border: '1px solid #F3F4F6' }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, fontSize: '1.125rem' }}>
              Recent Activity
            </Typography>
            <RecentActivity invoices={invoicesData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;

