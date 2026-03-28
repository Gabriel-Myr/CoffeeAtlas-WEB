import { type NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/server/api-helpers';
import { requireUser } from '@/lib/server/auth-user';
import { requireSupabaseServiceRoleServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const db = requireSupabaseServiceRoleServer();
    const { data, error } = await db
      .from('app_users')
      .select('id, nickname, avatar_url, created_at')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return apiSuccess({
      id: data.id,
      nickname: data.nickname,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
    });
  } catch (err) {
    return apiError(err);
  }
}
