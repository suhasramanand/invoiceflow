import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Invoice } from '../types';

interface PaymentStatusChartProps {
  invoices: Invoice[];
}

const PaymentStatusChart: React.FC<PaymentStatusChartProps> = ({ invoices }) => {
  const data = useMemo(() => {
    const statusCounts: { [key: string]: number } = {};

    invoices.forEach((invoice: Invoice) => {
      statusCounts[invoice.status] = (statusCounts[invoice.status] || 0) + 1;
    });

    const colors: { [key: string]: string } = {
      draft: '#9e9e9e',
      sent: '#2196f3',
      viewed: '#ff9800',
      paid: '#4caf50',
      overdue: '#f44336',
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[status] || '#9e9e9e',
    }));
  }, [invoices]);

  if (data.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        No invoice data available
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="40%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={65}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend 
            verticalAlign="bottom" 
            height={40}
            wrapperStyle={{ 
              paddingTop: '10px',
              fontSize: '0.875rem',
            }}
            iconType="square"
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PaymentStatusChart;

