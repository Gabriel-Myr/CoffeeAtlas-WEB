import { type NextRequest } from 'next/server';

import { apiError, apiSuccess } from '@/lib/server/api-helpers';
import { badRequest } from '@/lib/server/api-primitives';
import { upsertAppUser } from '@/lib/server/favorites-api';
import { signJwt } from '@/lib/server/auth-jwt';
import { code2Session } from '@/lib/server/wechat-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const code = typeof body?.code === 'string' ? body.code.trim() : '';
    if (!code) badRequest('code is required');

    const { openid, unionid } = await code2Session(code);
    const user = await upsertAppUser({
      openid,
      unionid,
      nickname: typeof body?.nickname === 'string' ? body.nickname : undefined,
      avatarUrl: typeof body?.avatarUrl === 'string' ? body.avatarUrl : undefined,
    });

    const token = await signJwt({ sub: user.id, openid, scope: 'user' });

    return apiSuccess({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
      },
    });
  } catch (err) {
    return apiError(err);
  }
}
