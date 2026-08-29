import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// service_role client — full DB access, bypasses RLS.
// This must ONLY ever run on the server. Never send this key to a browser.
//
// `realtime.transport` is set to a no-op stub so that supabase-js skips its
// native WebSocket check (which throws on Node < 22). This backend never uses
// realtime subscriptions — only DB queries and Storage uploads.
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    realtime: { transport: class {} as any },
  }
);