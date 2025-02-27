import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, Calendar } from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { useTransactions } from '../hooks/useTransactions';

export function Dashboard() {
  const { transactions, loading, error } = useTransactions();
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [totals, setTotals] = useState({
    balance: 0,
    income: 0,
    expenses: 0
  });

  useEffect(() => {
    if (transactions.length > 0) {
      const filteredTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return isWithinInterval(date, {
          start: parseISO(dateRange.startDate),
          end: parseISO(dateRange.endDate)
        });
      });

      const income = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = income - expenses;

      setTotals({
        balance,
        income,
        expenses
      });
    }
  }, [transactions, dateRange]);

  const recentTransactions = transactions
    .filter(t => {
      const date = new Date(t.date);
      return isWithinInterval(date, {
        start: parseISO(dateRange.startDate),
        end: parseISO(dateRange.endDate)
      });
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          Error loading dashboard data: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-44">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="relative flex-1 md:w-44">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Total Balance"
          amount={totals.balance.toFixed(2)}
          icon={<Wallet className="text-blue-500" size={24} />}
          className="bg-blue-50 border-blue-200"
        />
        <DashboardCard
          title="Total Income"
          amount={totals.income.toFixed(2)}
          icon={<ArrowUpRight className="text-green-500" size={24} />}
          className="bg-green-50 border-green-200"
        />
        <DashboardCard
          title="Total Expenses"
          amount={totals.expenses.toFixed(2)}
          icon={<ArrowDownRight className="text-red-500" size={24} />}
          className="bg-red-50 border-red-200"
        />
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <p className="text-sm text-gray-500">
            {format(parseISO(dateRange.startDate), 'MMM d, yyyy')} - {format(parseISO(dateRange.endDate), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-4 text-gray-500">Loading transactions...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="p-4 text-gray-500">No transactions found in the selected date range</div>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.date), 'MMM d, yyyy')} • {transaction.source}
                      {transaction.category && (
                        <span className="ml-2 text-gray-400">
                          {transaction.category}
                          {transaction.sub_category && ` / ${transaction.sub_category}`}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  amount: string;
  icon: React.ReactNode;
  className?: string;
}

function DashboardCard({ title, amount, icon, className = '' }: DashboardCardProps) {
  return (
    <div className={`p-6 rounded-lg border ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">${amount}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}