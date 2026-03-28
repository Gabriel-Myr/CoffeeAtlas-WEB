import type { NextRequest } from 'next/server';

import { type JwtPayload, verifyJwt } from './auth-jwt';
import { HttpError } from './api-primitives';

export interface AuthUser {
  id: string;
  openid: string;
}

export async function getCurrentUser(req: NextRequest): Promise<AuthUser | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;

  const token = auth.slice(7);
  try {
    const payload = await verifyJwt(token);
    return { id: payload.sub, openid: payload.openid };
  } catch {
    return null;
  }
}

export async function requireUser(req: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(req);
  if (!user) throw new HttpError(401, 'unauthorized', 'Authentication required');
  return user;
}
