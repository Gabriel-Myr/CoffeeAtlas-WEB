import { NextResponse } from 'next/server';

import type { ApiError, ApiResponse } from '@coffee-atlas/shared-types';
export {
  HttpError,
  badRequest,
  conflict,
  normalizeCountryCode,
  normalizeName,
  normalizeString,
  notFound,
  parseJsonNumber,
  parseLimitParam,
  parsePaginationParams,
  parsePositiveInteger,
  parseStringArray,
  sanitizeSearchTerm,
} from './api-primitives';
import { HttpError } from './api-primitives';

export function createRequestId() {
  return crypto.randomUUID();
}

function createNoStoreHeaders() {
  return {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };
}

export function apiSuccess<T>(data: T, requestId = createRequestId()) {
  const body: ApiResponse<T> = {
    ok: true,
    data,
    meta: {
      requestId,
    },
  };

  return NextResponse.json(body, {
    headers: createNoStoreHeaders(),
  });
}

export function apiError(error: unknown, requestId = createRequestId()) {
  const normalized =
    error instanceof HttpError
      ? error
      : new HttpError(500, 'internal_error', 'Internal server error');

  const body: ApiError = {
    ok: false,
    error: {
      code: normalized.code,
      message: normalized.message,
    },
    meta: {
      requestId,
    },
  };

  return NextResponse.json(body, {
    status: normalized.status,
    headers: createNoStoreHeaders(),
  });
}

export function toLegacyError(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json(
      { error: error.message, code: error.status },
      {
        status: error.status,
        headers: createNoStoreHeaders(),
      }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error', code: 500 },
    {
      status: 500,
      headers: createNoStoreHeaders(),
    }
  );
}
