import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/types';

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('useCoupons:', error);
    setCoupons((data as Coupon[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  return { coupons, loading, refetch: fetchCoupons };
}
