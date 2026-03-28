import type { NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

import { HttpError } from './api-primitives.ts';

export interface AdminContext {
  actor: string;
}

const ADMIN_TOKEN_ENV = 'ADMIN_API_TOKEN';

function normalizeAdminToken(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function readBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;

  const [scheme, ...rest] = authorization.trim().split(/\s+/);
  if (!scheme || !/^bearer$/i.test(scheme)) return null;

  const token = rest.join(' ').trim();
  return token.length > 0 ? token : null;
}

function secureTokenEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left, 'utf8');
  const rightBytes = Buffer.from(right, 'utf8');
  if (leftBytes.length !== rightBytes.length) return false;
  return timingSafeEqual(leftBytes, rightBytes);
}

export async function requireAdmin(request: NextRequest): Promise<AdminContext> {
  const configuredToken = normalizeAdminToken(process.env[ADMIN_TOKEN_ENV]);
  if (!configuredToken) {
    throw new HttpError(
      403,
      'admin_auth_disabled',
      `Admin endpoints are disabled until ${ADMIN_TOKEN_ENV} is configured`
    );
  }

  const providedToken = readBearerToken(request);
  if (!providedToken || !secureTokenEqual(providedToken, configuredToken)) {
    throw new HttpError(403, 'admin_forbidden', 'Admin authorization is required');
  }

  return {
    actor: 'admin-token',
  };
}
