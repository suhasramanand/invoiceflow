import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Invoice } from '../types';
import { format, parseISO } from 'date-fns';

interface RevenueChartProps {
  invoices: Invoice[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ invoices }) => {
  const data = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};

    invoices.forEach((invoice) => {
      if (invoice.status === 'paid') {
        const monthKey = format(parseISO(invoice.updated_at), 'MMM yyyy');
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + Number(invoice.total);
      }
    });

    return Object.entries(monthlyData)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => {
        const dateA = parseISO(a.month);
        const dateB = parseISO(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Last 6 months
  }, [invoices]);

  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        No revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Bar dataKey="revenue" fill="#1976d2" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;

