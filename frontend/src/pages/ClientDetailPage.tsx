import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService, invoiceService } from '../services/api';
import { CreateClientDTO, Invoice } from '../types';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const { data: client, isLoading: loadingClient } = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientService.getById(id!),
    enabled: !isNew && !!id,
  });

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ['invoices', { clientId: id }],
    queryFn: () => invoiceService.getAll({ clientId: id }),
    enabled: !isNew && !!id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        zip: client.zip || '',
        country: client.country || '',
      });
    }
  }, [client, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateClientDTO) => clientService.create(data),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      navigate(`/clients/${newClient.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateClientDTO>) => clientService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
    },
  });

  const onSubmit = (data: ClientFormData) => {
    const clientData: CreateClientDTO = {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      zip: data.zip || undefined,
      country: data.country || undefined,
    };

    if (isNew) {
      createMutation.mutate(clientData);
    } else {
      updateMutation.mutate(clientData);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: {
      [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    } = {
      draft: 'default',
      sent: 'info',
      viewed: 'warning',
      paid: 'success',
      overdue: 'error',
    };
    return colors[status] || 'default';
  };

  if (loadingClient && !isNew) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const outstandingBalance =
    invoices?.filter((inv) => inv.status !== 'paid').reduce((sum, inv) => sum + Number(inv.total), 0) || 0;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        {isNew ? 'New Client' : client?.name || 'Client'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Client Information
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                    aria-required="true"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    {...register('address')}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="City"
                    {...register('city')}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="State"
                    {...register('state')}
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    {...register('zip')}
                    error={!!errors.zip}
                    helperText={errors.zip?.message}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    {...register('country')}
                    error={!!errors.country}
                    helperText={errors.country?.message}
                  />
                </Grid>
              </Grid>

              {(createMutation.isError || updateMutation.isError) && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {createMutation.error?.message || updateMutation.error?.message || 'An error occurred'}
                </Alert>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {isNew
                    ? createMutation.isPending
                      ? 'Creating...'
                      : 'Create Client'
                    : updateMutation.isPending
                    ? 'Updating...'
                    : 'Update Client'}
                </Button>
                <Button variant="outlined" onClick={() => navigate('/clients')}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {!isNew && (
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Outstanding Balance
                </Typography>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  ${outstandingBalance.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Invoices
                </Typography>
                <Typography variant="h6">{invoices?.length || 0}</Typography>
              </CardContent>
            </Card>

            {invoices && invoices.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Invoices
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.slice(0, 5).map((invoice) => (
                        <TableRow
                          key={invoice.id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <TableCell>{invoice.invoice_number}</TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              size="small"
                              color={getStatusColor(invoice.status)}
                            />
                          </TableCell>
                          <TableCell>${Number(invoice.total).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ClientDetailPage;

