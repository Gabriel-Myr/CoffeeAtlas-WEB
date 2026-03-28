import assert from 'node:assert/strict';
import test from 'node:test';

import { requireSupabaseCatalogRead } from '../src/services/catalog-read-mode.ts';

test('requireSupabaseCatalogRead returns client when supabase env is ready', () => {
  const client = { kind: 'supabase' };

  assert.equal(
    requireSupabaseCatalogRead(true, () => client),
    client
  );
});

test('requireSupabaseCatalogRead stops catalog reads from falling back to api mode', () => {
  assert.throws(
    () => requireSupabaseCatalogRead(false, () => ({ kind: 'supabase' })),
    /当前目录页不再回退到 API 联调地址/
  );
});
