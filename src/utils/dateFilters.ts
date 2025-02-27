import { subDays, subMonths, subYears, isAfter } from 'date-fns';

export function filterTransactionsByDate(transactions: any[], range: string) {
  const now = new Date();
  let cutoffDate;

  switch (range) {
    case 'week':
      cutoffDate = subDays(now, 7);
      break;
    case 'month':
      cutoffDate = subMonths(now, 1);
      break;
    case 'year':
      cutoffDate = subYears(now, 1);
      break;
    default:
      cutoffDate = subMonths(now, 1);
  }

  return transactions.filter(transaction => 
    isAfter(new Date(transaction.date), cutoffDate)
  );
} 