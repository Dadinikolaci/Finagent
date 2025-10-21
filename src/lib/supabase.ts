import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Define TypeScript types for your database tables
export interface Transaction {
  id?: number;
  created_at?: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // 'YYYY-MM-DD'
}

export interface Budget {
  id?: number;
  created_at?: string;
  category: string;
  total_amount: number;
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL or Anon Key is missing from .env file');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
