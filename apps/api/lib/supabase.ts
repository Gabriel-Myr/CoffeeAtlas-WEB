import { createClient } from '@supabase/supabase-js';
import { HttpError } from './server/api-primitives.ts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseBrowserEnv = Boolean(supabaseUrl && supabaseAnonKey);
export const hasSupabaseServerEnv = Boolean(supabaseUrl && (supabaseServiceRoleKey || supabaseAnonKey));
export const hasSupabaseServiceRoleEnv = Boolean(supabaseUrl && supabaseServiceRoleKey);

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

export const supabaseServiceRoleServer = hasSupabaseServiceRoleEnv
  ? createClient(
      supabaseUrl!,
      supabaseServiceRoleKey!,
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
    throw new HttpError(
      500,
      'supabase_server_config_missing',
      'Missing server-side Supabase configuration'
    );
  }

  return supabaseServer;
}

export function requireSupabaseServiceRoleServer() {
  if (!supabaseServiceRoleServer) {
    throw new HttpError(
      500,
      'supabase_service_role_missing',
      'SUPABASE_SERVICE_ROLE_KEY is required for app_users and user_favorites operations'
    );
  }

  return supabaseServiceRoleServer;
}

export function requireSupabaseBrowser() {
  if (!supabaseBrowser) {
    throw new HttpError(
      500,
      'supabase_browser_config_missing',
      'Missing browser-side Supabase configuration'
    );
  }

  return supabaseBrowser;
}
