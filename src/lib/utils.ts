import { format } from 'date-fns';

export const formatCurrency = (value: string | number, currency = 'USDC'): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${num.toFixed(2)} ${currency}`;
};

export const formatPercentage = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}%`;
};

export const formatPLColor = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num > 0) return 'text-green-600';
  if (num < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
};

export const formatDateShort = (dateString: string): string => {
  return format(new Date(dateString), 'MMM dd');
};

export const calculatePercentageChange = (current: number, cost: number): number => {
  if (cost === 0) return 0;
  return ((current - cost) / cost) * 100;
};