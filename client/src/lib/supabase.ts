/**
 * Campamento Gecko - Supabase Client
 * Configuração do cliente Supabase com tipagem
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey);
