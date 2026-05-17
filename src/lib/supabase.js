// Supabase client. If env vars are missing the app still works,
// it just falls back to localStorage-only mode (single device).
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && anonKey);

export const supabase = supabaseEnabled
  ? createClient(url, anonKey, { auth: { persistSession: false } })
  : null;

// The whole app state lives in one row of the `app_state` table.
export const STATE_ROW_ID = 'singleton';
