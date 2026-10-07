import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Brand } from '@/types';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name', { ascending: true });
    if (error) console.error('useBrands:', error);
    setBrands((data as Brand[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return { brands, loading, refetch: fetchBrands };
}
