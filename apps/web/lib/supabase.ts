import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseBrowserEnv = Boolean(supabaseUrl && supabaseAnonKey);
export const hasSupabaseServerEnv = Boolean(supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey));

export const supabaseBrowser = hasSupabaseBrowserEnv
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const supabaseServer = hasSupabaseServerEnv
  ? createClient(
      supabaseUrl!,
      supabaseServiceRoleKey || supabaseAnonKey!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;

export function requireSupabaseServer() {
  if (!supabaseServer) {
    throw new Error('Missing server-side Supabase configuration');
  }

  return supabaseServer;
}

export function requireSupabaseBrowser() {
  if (!supabaseBrowser) {
    throw new Error('Missing browser-side Supabase configuration');
  }

  return supabaseBrowser;
}
