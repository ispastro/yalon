import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Uses the anon key deliberately — RLS policies (schema.sql: "staff can read/update…")
// restrict access to authenticated users with role:staff in their JWT metadata.
// The anon key alone grants nothing beyond what RLS explicitly allows.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
