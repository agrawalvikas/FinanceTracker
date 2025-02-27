import { useEffect, useState } from 'react';
import { getSources } from '../lib/transactions';
import type { Source } from '../types';

export function useSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchSources() {
      try {
        const data = await getSources();
        setSources(data);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch sources');
        setError(error);
        console.error('Error fetching sources:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSources();
  }, []);

  return { sources, loading, error };
} 