import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Position = {
  id: number;
  title: string;
  description: string;
  created_at: string;
};

export type Resume = {
  id: number;
  position_id: number;
  content: string;
  is_ai: boolean;
  matching_score: number;
  created_at: string;
}; 