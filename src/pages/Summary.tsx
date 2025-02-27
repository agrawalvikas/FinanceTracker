import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, parseISO } from 'date-fns';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { Loader2, Calendar } from 'lucide-react';

export function Summary() {
  const [viewType, setViewType] = useState<'expense' | 'income'>('expense');
  const { transactions, loading: loadingTransactions, error: transactionsError } = useTransactions();
  const { categories, loading: loadingCategories, error: categoriesError } = useCategories();
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 11), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  // Generate months between selected dates
  const months = eachMonthOfInterval({
    start: parseISO(dateRange.startDate),
    end: parseISO(dateRange.endDate)
  });

  const calculateMonthlyTotal = (month: Date, category?: string) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        const matchesMonth = date >= start && date <= end;
        const matchesType = t.type === viewType;
        const matchesCategory = !category || t.category === category;
        const withinRange = date >= parseISO(dateRange.startDate) && date <= parseISO(dateRange.endDate);
        return matchesMonth && matchesType && matchesCategory && withinRange;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateCategoryTotal = (category: string) => {
    return transactions
      .filter(t => {
        const date = new Date(t.date);
        return t.type === viewType && 
               t.category === category &&
               date >= parseISO(dateRange.startDate) && 
               date <= parseISO(dateRange.endDate);
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const totalAmount = transactions
    .filter(t => {
      const date = new Date(t.date);
      return t.type === viewType &&
             date >= parseISO(dateRange.startDate) && 
             date <= parseISO(dateRange.endDate);
    })
    .reduce((sum, t) => sum + t.amount, 0);

  if (transactionsError || categoriesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error loading data: {transactionsError?.message || categoriesError?.message}</p>
        </div>
      </div>
    );
  }

  if (loadingTransactions || loadingCategories) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Summary</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex items-center gap-4 flex-1 sm:flex-none">
            <div className="relative flex-1 sm:w-44">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="relative flex-1 sm:w-44">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewType('expense')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md ${
                viewType === 'expense'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setViewType('income')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md ${
                viewType === 'income'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Income
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Total {viewType === 'expense' ? 'Expenses' : 'Income'}: ${totalAmount.toFixed(2)}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {format(parseISO(dateRange.startDate), 'MMM d, yyyy')} - {format(parseISO(dateRange.endDate), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {viewType === 'expense' ? 'Category' : 'Source'}
                </th>
                {months.map(month => (
                  <th
                    key={month.toISOString()}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {format(month, 'MMM yyyy')}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {viewType === 'expense' ? (
                categories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    {months.map(month => (
                      <td
                        key={month.toISOString()}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        ${calculateMonthlyTotal(month, category.name).toFixed(2)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${calculateCategoryTotal(category.name).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Total Income
                  </td>
                  {months.map(month => (
                    <td
                      key={month.toISOString()}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      ${calculateMonthlyTotal(month).toFixed(2)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${totalAmount.toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}