import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Staff } from '@/types';

interface AuthContextValue {
  session: Session | null;
  staff: Staff | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshStaff: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async (uid: string) => {
    const { data } = await supabase
      .from('staff')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    setStaff((data as Staff) ?? null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        fetchStaff(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      (async () => {
        setSession(s);
        if (s?.user) {
          await fetchStaff(s.user.id);
        } else {
          setStaff(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setStaff(null);
    setSession(null);
  };

  const refreshStaff = async () => {
    if (session?.user) {
      await fetchStaff(session.user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ session, staff, loading, signOut, refreshStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
