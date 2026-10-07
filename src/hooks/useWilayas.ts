import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Wilaya } from '@/types';

export function useWilayas() {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWilayas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wilayas')
      .select('*')
      .order('code', { ascending: true });
    if (error) console.error('useWilayas:', error);
    setWilayas((data as Wilaya[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWilayas();
  }, [fetchWilayas]);

  return { wilayas, loading, refetch: fetchWilayas };
}
