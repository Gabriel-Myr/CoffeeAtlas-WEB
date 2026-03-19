import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HttpError,
  normalizeCountryCode,
  parsePaginationParams,
  sanitizeSearchTerm,
} from '../lib/server/api-primitives.ts';

test('parsePaginationParams supports pageSize and legacy limit', () => {
  const modern = parsePaginationParams(new URLSearchParams('page=2&pageSize=15'));
  assert.deepEqual(modern, {
    page: 2,
    pageSize: 15,
    offset: 15,
  });

  const legacy = parsePaginationParams(new URLSearchParams('page=3&limit=10'), {
    legacyLimitParam: 'limit',
  });
  assert.deepEqual(legacy, {
    page: 3,
    pageSize: 10,
    offset: 20,
  });
});

test('normalizeCountryCode uppercases valid values and rejects invalid ones', () => {
  assert.equal(normalizeCountryCode('cn'), 'CN');
  assert.equal(normalizeCountryCode(undefined), undefined);

  assert.throws(() => normalizeCountryCode('china'), (error: unknown) => {
    assert.ok(error instanceof HttpError);
    assert.equal(error.status, 400);
    assert.equal(error.code, 'invalid_country_code');
    return true;
  });
});

test('sanitizeSearchTerm strips unsafe postgrest characters', () => {
  assert.equal(sanitizeSearchTerm("peet's, coffee%(light)"), 'peet s  coffee  light');
});
