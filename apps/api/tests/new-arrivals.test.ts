import assert from 'node:assert/strict';
import test from 'node:test';

import { extractLatestNewArrivalBeanIds } from '../lib/new-arrivals-helpers.ts';

test('extractLatestNewArrivalBeanIds keeps inserted and upserted roaster beans from the latest sync', () => {
  assert.deepEqual(
    extractLatestNewArrivalBeanIds([
      { entity_id: 'bean-1', action: 'INSERT' },
      { entity_id: 'bean-2', action: 'UPSERT' },
      { entity_id: 'bean-1', action: 'INSERT' },
      { entity_id: 'bean-3', action: 'UPDATE' },
      { entity_id: '', action: 'INSERT' },
      { entity_id: null, action: 'INSERT' },
      { entity_id: 'bean-4', action: 'INSERT' },
    ]),
    ['bean-1', 'bean-2', 'bean-4']
  );
});
