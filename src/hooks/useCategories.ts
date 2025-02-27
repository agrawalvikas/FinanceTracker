import { useEffect, useState } from 'react';
import { getCategories } from '../lib/transactions';
import type { Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cacheBust, setCacheBust] = useState(0);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch categories');
        setError(error);
        console.error('Error fetching categories:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [cacheBust]);

  const refreshCategories = () => {
    console.log('Refreshing categories...');
    setCacheBust(prev => prev + 1);
  };

  return { categories, loading, error, refreshCategories };
}
