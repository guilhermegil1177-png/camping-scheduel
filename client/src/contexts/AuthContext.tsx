/**
 * Campamento Gecko - Auth Context
 * Gestão de autenticação com Supabase
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, AuthState } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isDirector: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo user for offline/no-supabase mode
const DEMO_USER: User = {
  id: 'demo-user',
  email: 'demo@campamentogecko.com',
  nome: 'Demo Director',
  role: 'director',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Modo demo sem Supabase
      setState({ user: DEMO_USER, isLoading: false, isAuthenticated: true });
      return;
    }

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    });

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      setState({ user: data as User, isLoading: false, isAuthenticated: true });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      // Demo login
      if (email === 'demo' || email.includes('gecko')) {
        setState({ user: DEMO_USER, isLoading: false, isAuthenticated: true });
        return {};
      }
      return { error: 'Supabase não configurado. Use email "demo@campamentogecko.com"' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  const isDirector = () => state.user?.role === 'director' || state.user?.role === 'admin';
  const isAdmin = () => state.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, isDirector, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
