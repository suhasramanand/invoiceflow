import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  TextField,
  Typography,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService, clientService } from '../services/api';
import { CreateInvoiceDTO, CreateLineItemDTO, Invoice } from '../types';
import { calculateTotal } from '../utils/invoiceCalculator';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0, 'Rate must be greater than or equal to 0'),
});

const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Client is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  payment_terms: z.string().min(1, 'Payment terms is required'),
  tax_rate: z.number().min(0).max(100),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  discount_value: z.number().min(0).optional(),
  notes: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, 'At least one line item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const steps = ['Client & Dates', 'Line Items', 'Tax & Discounts', 'Review'];

const InvoiceBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getAll(),
  });

  const { data: existingInvoice, isLoading: loadingInvoice } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceService.getById(id!),
    enabled: !!id,
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      client_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      payment_terms: 'Net 30',
      tax_rate: 0,
      discount_type: undefined,
      discount_value: undefined,
      notes: '',
      line_items: [{ description: '', quantity: 1, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'line_items',
  });

  useEffect(() => {
    if (existingInvoice) {
      setValue('client_id', existingInvoice.client_id);
      setValue('issue_date', existingInvoice.issue_date.split('T')[0]);
      setValue('due_date', existingInvoice.due_date.split('T')[0]);
      setValue('payment_terms', existingInvoice.payment_terms);
      setValue('tax_rate', Number(existingInvoice.tax_rate));
      setValue('discount_type', existingInvoice.discount_type);
      setValue('discount_value', existingInvoice.discount_value ? Number(existingInvoice.discount_value) : undefined);
      setValue('notes', existingInvoice.notes || '');
      setValue(
        'line_items',
        existingInvoice.line_items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
        }))
      );
    }
  }, [existingInvoice, setValue]);

  const watchedValues = watch();
  const totals = calculateTotal(
    watchedValues.line_items?.reduce((sum, item) => sum + item.quantity * item.rate, 0) || 0,
    watchedValues.tax_rate || 0,
    watchedValues.discount_type,
    watchedValues.discount_value
  );

  const createMutation = useMutation({
    mutationFn: (data: CreateInvoiceDTO) => invoiceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateInvoiceDTO & { status?: Invoice['status'] }>) => invoiceService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
    },
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit(onSubmit)();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = (data: InvoiceFormData) => {
    const invoiceData: CreateInvoiceDTO = {
      ...data,
      line_items: data.line_items as CreateLineItemDTO[],
    };

    if (id) {
      updateMutation.mutate(invoiceData);
    } else {
      createMutation.mutate(invoiceData);
    }
  };

  const handleGeneratePDF = async () => {
    if (existingInvoice) {
      await generateInvoicePDF(existingInvoice);
    }
  };

  if (loadingInvoice) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 700 }}>
        {id ? 'Edit Invoice' : 'Create Invoice'}
      </Typography>
      <Paper sx={{ p: 4, border: '1px solid #F3F4F6' }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Client"
                  {...register('client_id')}
                  error={!!errors.client_id}
                  helperText={errors.client_id?.message}
                  value={watchedValues.client_id || ''}
                  SelectProps={{
                    native: false,
                  }}
                >
                  {clients?.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Issue Date"
                  type="date"
                  {...register('issue_date')}
                  error={!!errors.issue_date}
                  helperText={errors.issue_date?.message}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  {...register('due_date')}
                  error={!!errors.due_date}
                  helperText={errors.due_date?.message}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Payment Terms"
                  {...register('payment_terms')}
                  error={!!errors.payment_terms}
                  helperText={errors.payment_terms?.message}
                  value={watchedValues.payment_terms || ''}
                >
                  <MenuItem value="Net 15">Net 15</MenuItem>
                  <MenuItem value="Net 30">Net 30</MenuItem>
                  <MenuItem value="Net 45">Net 45</MenuItem>
                  <MenuItem value="Net 60">Net 60</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Line Items</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => append({ description: '', quantity: 1, rate: 0 })}
                  variant="outlined"
                >
                  Add Item
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            {...register(`line_items.${index}.description`)}
                            error={!!errors.line_items?.[index]?.description}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            {...register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                            error={!!errors.line_items?.[index]?.quantity}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            {...register(`line_items.${index}.rate`, { valueAsNumber: true })}
                            error={!!errors.line_items?.[index]?.rate}
                          />
                        </TableCell>
                        <TableCell>
                          ${(
                            (watchedValues.line_items?.[index]?.quantity || 0) *
                            (watchedValues.line_items?.[index]?.rate || 0)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                            aria-label="Remove line item"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {errors.line_items && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.line_items.message || 'Line items are required'}
                </Alert>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tax Rate (%)"
                  type="number"
                  {...register('tax_rate', { valueAsNumber: true })}
                  error={!!errors.tax_rate}
                  helperText={errors.tax_rate?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Discount Type"
                  {...register('discount_type')}
                  value={watchedValues.discount_type || ''}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="fixed">Fixed Amount</MenuItem>
                </TextField>
              </Grid>
              {watchedValues.discount_type && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={`Discount Value ${watchedValues.discount_type === 'percentage' ? '(%)' : '($)'}`}
                    type="number"
                    {...register('discount_value', { valueAsNumber: true })}
                    error={!!errors.discount_value}
                    helperText={errors.discount_value?.message}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  {...register('notes')}
                  error={!!errors.notes}
                  helperText={errors.notes?.message}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Invoice Summary
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Client: <strong style={{ color: '#111827' }}>{clients?.find((c) => c.id === watchedValues.client_id)?.name}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Issue Date: <strong style={{ color: '#111827' }}>{watchedValues.issue_date}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Due Date: <strong style={{ color: '#111827' }}>{watchedValues.due_date}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Payment Terms: <strong style={{ color: '#111827' }}>{watchedValues.payment_terms}</strong>
                  </Typography>
                  {existingInvoice && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Status:
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={existingInvoice.status}
                        onChange={(e) => {
                          updateMutation.mutate({ status: e.target.value as Invoice['status'] });
                        }}
                        SelectProps={{
                          native: false,
                        }}
                        sx={{ maxWidth: 200 }}
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="sent">Sent</MenuItem>
                        <MenuItem value="viewed">Viewed</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="overdue">Overdue</MenuItem>
                      </TextField>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Subtotal: ${totals.subtotal.toFixed(2)}
                    </Typography>
                    {totals.discountAmount > 0 && (
                      <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                        Discount: -${totals.discountAmount.toFixed(2)}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Tax ({watchedValues.tax_rate}%): ${totals.taxAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
                      Total: ${totals.total.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {existingInvoice && (
                <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    onClick={handleGeneratePDF}
                    sx={{ borderColor: '#E5E7EB' }}
                  >
                    Generate PDF
                  </Button>
                  {existingInvoice.status === 'draft' && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        updateMutation.mutate({ status: 'sent' });
                      }}
                      disabled={updateMutation.isPending}
                    >
                      Mark as Sent
                    </Button>
                  )}
                  {existingInvoice.status === 'sent' && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        updateMutation.mutate({ status: 'viewed' });
                      }}
                      disabled={updateMutation.isPending}
                      sx={{ borderColor: '#E5E7EB' }}
                    >
                      Mark as Viewed
                    </Button>
                  )}
                  {(existingInvoice.status === 'sent' || existingInvoice.status === 'viewed') && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        updateMutation.mutate({ status: 'paid' });
                      }}
                      disabled={updateMutation.isPending}
                      sx={{ backgroundColor: '#10B981', '&:hover': { backgroundColor: '#059669' } }}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </Box>
              )}
            </Box>
          )}

          {(createMutation.isError || updateMutation.isError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createMutation.error?.message || updateMutation.error?.message || 'An error occurred'}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {activeStep === steps.length - 1
                ? id
                  ? 'Update Invoice'
                  : 'Create Invoice'
                : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default InvoiceBuilderPage;

