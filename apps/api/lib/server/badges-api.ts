import { badRequest } from './api-primitives.ts';
import { requireSupabaseServiceRoleServer } from '../supabase.ts';

interface UserBadgeProgressRow {
  badge_id: string;
}

export function normalizeBadgeIds(badgeIds: unknown): string[] {
  if (!Array.isArray(badgeIds)) {
    badRequest('badgeIds must be an array');
  }

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const badgeId of badgeIds) {
    if (typeof badgeId !== 'string') {
      badRequest('badgeIds must contain only strings');
    }

    const trimmed = badgeId.trim();
    if (!trimmed) {
      badRequest('badgeIds must contain only non-empty strings');
    }

    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
}

export async function getBadgeIds(userId: string): Promise<string[]> {
  const db = requireSupabaseServiceRoleServer();
  const { data, error } = await db
    .from('user_badge_progress')
    .select('badge_id')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: true })
    .order('badge_id', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as UserBadgeProgressRow[]).map((row) => row.badge_id);
}

export async function syncBadgeIds(userId: string, badgeIds: string[]): Promise<number> {
  if (badgeIds.length === 0) return 0;

  const db = requireSupabaseServiceRoleServer();
  const now = new Date().toISOString();
  const rows = badgeIds.map((badgeId) => ({
    user_id: userId,
    badge_id: badgeId,
    unlocked_at: now,
  }));

  const { error } = await db
    .from('user_badge_progress')
    .upsert(rows, {
      onConflict: 'user_id,badge_id',
      ignoreDuplicates: true,
    });

  if (error) throw error;
  return badgeIds.length;
}
