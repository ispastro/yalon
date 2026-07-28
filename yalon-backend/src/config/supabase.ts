import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// service_role client — full DB access, bypasses RLS.
// This must ONLY ever run on the server. Never send this key to a browser.
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);