import type { ApiError, ApiResponse } from '@coffee-atlas/shared-types';

export type ApiEnvelope<T> = ApiResponse<T> | ApiError;

interface ApiClientErrorOptions {
  code?: string;
  requestId?: string;
}

const ERROR_MESSAGE_KEYS = ['message', 'error', 'errMsg', 'detail', 'details', 'reason', 'description'] as const;
const MAX_SERIALIZED_ERROR_LENGTH = 240;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function truncateSerializedValue(value: string): string {
  if (value.length <= MAX_SERIALIZED_ERROR_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_SERIALIZED_ERROR_LENGTH)}...`;
}

function safelySerialize(value: unknown): string | undefined {
  try {
    return truncateSerializedValue(JSON.stringify(value));
  } catch {
    return undefined;
  }
}

function collectErrorMessageParts(value: unknown, depth = 0): string[] {
  if (depth > 4 || value === null || value === undefined) {
    return [];
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized ? [normalized] : [];
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return ['[]'];
    }

    return unique(value.flatMap((item) => collectErrorMessageParts(item, depth + 1)));
  }

  if (!isRecord(value)) {
    return [];
  }

  const prioritizedParts = unique(
    ERROR_MESSAGE_KEYS.flatMap((key) => {
      if (!(key in value)) {
        return [];
      }

      return collectErrorMessageParts(value[key], depth + 1);
    })
  );

  if (prioritizedParts.length > 0) {
    return prioritizedParts;
  }

  const serialized = safelySerialize(value);
  return serialized ? [serialized] : [];
}

export class ApiClientError extends Error {
  readonly code?: string;
  readonly requestId?: string;

  constructor(message: string, options: ApiClientErrorOptions = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.code = options.code;
    this.requestId = options.requestId;
  }
}

export function isApiErrorPayload(payload: unknown): payload is ApiError {
  if (!isRecord(payload) || payload.ok !== false) {
    return false;
  }

  const error = payload.error;
  const meta = payload.meta;
  return (
    isRecord(error) &&
    typeof error.code === 'string' &&
    typeof error.message === 'string' &&
    isRecord(meta) &&
    typeof meta.requestId === 'string'
  );
}

export function isApiResponsePayload<T>(payload: unknown): payload is ApiResponse<T> {
  if (!isRecord(payload) || payload.ok !== true || !('data' in payload)) {
    return false;
  }

  const meta = payload.meta;
  return isRecord(meta) && typeof meta.requestId === 'string';
}

export function extractApiErrorMessage(payload: unknown): string | undefined {
  if (isApiErrorPayload(payload)) {
    return payload.error.message;
  }

  const directParts = collectErrorMessageParts(payload);
  if (!isRecord(payload)) {
    return directParts.length > 0 ? directParts.join('；') : undefined;
  }

  const directError = payload.error;
  const errorParts = collectErrorMessageParts(directError);
  if (errorParts.length > 0) {
    return errorParts.join('；');
  }

  const topLevelParts = unique(
    ['message', 'errMsg'].flatMap((key) => {
      if (!(key in payload)) {
        return [];
      }

      return collectErrorMessageParts(payload[key]);
    })
  );

  if (topLevelParts.length > 0) {
    return topLevelParts.join('；');
  }

  return directParts.length > 0 ? directParts.join('；') : undefined;
}

export function unwrapApiResponse<T>(payload: ApiEnvelope<T> | unknown): T {
  if (isApiResponsePayload<T>(payload)) {
    return payload.data;
  }

  if (isApiErrorPayload(payload)) {
    throw new ApiClientError(payload.error.message, {
      code: payload.error.code,
      requestId: payload.meta.requestId,
    });
  }

  throw new ApiClientError('请求失败');
}
