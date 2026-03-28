import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const apiRoot = path.resolve(import.meta.dirname, '..');

function readApiFile(relativePath: string): string {
  return readFileSync(path.join(apiRoot, relativePath), 'utf8');
}

test('supabase module exposes a strict service-role accessor while keeping anon fallback for general server reads', () => {
  const source = readApiFile('lib/supabase.ts');

  assert.match(source, /supabaseServiceRoleKey \|\| supabaseAnonKey/);
  assert.match(source, /export const hasSupabaseServiceRoleEnv = Boolean\(supabaseUrl && supabaseServiceRoleKey\)/);
  assert.match(source, /export const supabaseServiceRoleServer = hasSupabaseServiceRoleEnv/);
  assert.match(source, /export function requireSupabaseServiceRoleServer\(\)/);
  assert.match(source, /supabase_service_role_missing/);
});

test('favorites and me routes use strict service-role accessor for app_users and user_favorites access', () => {
  const favoritesApi = readApiFile('lib/server/favorites-api.ts');
  const meRoute = readApiFile('app/api/v1/me/route.ts');

  assert.match(favoritesApi, /requireSupabaseServiceRoleServer/);
  assert.doesNotMatch(favoritesApi, /requireSupabaseServer\(/);
  assert.match(meRoute, /requireSupabaseServiceRoleServer/);
  assert.doesNotMatch(meRoute, /requireSupabaseServer\(/);
});
