import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { LandingPage } from '@/types';

export function useLandingPages() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLandingPages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('useLandingPages:', error);
    setLandingPages((data as LandingPage[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLandingPages();
  }, [fetchLandingPages]);

  return { landingPages, loading, refetch: fetchLandingPages };
}
