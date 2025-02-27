import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, X, Loader2 } from 'lucide-react';
import { createTransaction, updateTransaction } from '../lib/transactions';
import { useCategories } from '../hooks/useCategories';
import { useSources } from '../hooks/useSources';

export function ExpenseForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.state?.isEditing;
  const editData = location.state?.transaction;

  const { categories, loading: loadingCategories, refreshCategories } = useCategories();
  const { sources, loading: loadingSources } = useSources();
  const [formData, setFormData] = useState({
    date: editData?.date || new Date().toISOString().split('T')[0],
    amount: editData?.amount || '',
    description: editData?.description || '',
    category: editData?.category || '',
    sub_category: editData?.sub_category || '',
    source: editData?.source || '',
    notes: editData?.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const transactionData = {
        date: formData.date,
        amount: Number(formData.amount),
        description: formData.description,
        category: formData.category ?? '',
        sub_category: formData.sub_category ?? '',
        source: formData.source,
        notes: formData.notes ?? null,
        type: 'expense' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isEditing && editData?.id) {
        await updateTransaction(editData.id, transactionData);
      } else {
        await createTransaction(transactionData);
      }
      navigate('/transactions');
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Expense' : 'Add Expense'}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
        <button onClick={refreshCategories}>Refresh Categories</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            {loadingCategories ? (
              <div className="flex items-center space-x-2 h-10">
                <Loader2 className="animate-spin text-blue-500" size={20} />
                <span className="text-gray-500">Loading categories...</span>
              </div>
            ) : (
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor="sub_category" className="block text-sm font-medium text-gray-700 mb-1">
              Sub-category
            </label>
            <select
              id="sub_category"
              name="sub_category"
              value={formData.sub_category}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={!formData.category || loadingCategories}
            >
              <option value="">Select a sub-category</option>
              {selectedCategory?.sub_categories?.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          {loadingSources ? (
            <div className="flex items-center space-x-2 h-10">
              <Loader2 className="animate-spin text-blue-500" size={20} />
              <span className="text-gray-500">Loading sources...</span>
            </div>
          ) : (
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a source</option>
              {sources.map(source => (
                <option key={source.id} value={source.name}>{source.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save size={16} className="mr-2" />
            {isEditing ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
