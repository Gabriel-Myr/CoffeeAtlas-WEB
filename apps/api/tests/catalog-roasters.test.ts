import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveRoasterQueryPlan } from '../lib/catalog-roaster-query.ts';

test('resolveRoasterQueryPlan uses paged mode when no feature filter is present', () => {
  assert.deepEqual(resolveRoasterQueryPlan({ limit: 20, offset: 40 }), {
    mode: 'paged',
    limit: 20,
    offset: 40,
  });
});

test('resolveRoasterQueryPlan keeps collection mode for feature-filtered queries', () => {
  assert.deepEqual(resolveRoasterQueryPlan({ limit: 20, offset: 40, feature: 'has_image' }), {
    mode: 'collection',
    limit: 20,
    offset: 40,
  });
});

test('resolveRoasterQueryPlan keeps collection mode when limit is missing', () => {
  assert.deepEqual(resolveRoasterQueryPlan({ offset: 40 }), {
    mode: 'collection',
    limit: undefined,
    offset: 40,
  });
});
