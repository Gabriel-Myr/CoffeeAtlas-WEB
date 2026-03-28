import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveAllBeansEntryState, resolveAllBeansRouteParams } from '../src/pages/all-beans/route-params.ts';

test('resolveAllBeansRouteParams defaults to the unified discover page', () => {
  assert.deepEqual(resolveAllBeansRouteParams({ tab: 'new' }), {
    landingMode: 'default',
  });
});

test('resolveAllBeansRouteParams maps entry=guided to guided landing mode', () => {
  assert.deepEqual(resolveAllBeansRouteParams({ entry: 'guided' }), {
    landingMode: 'guided',
  });
});

test('resolveAllBeansRouteParams maps entry=direct to direct landing mode', () => {
  assert.deepEqual(resolveAllBeansRouteParams({ entry: 'direct' }), {
    landingMode: 'direct',
  });
});

test('resolveAllBeansEntryState maps entry intent guided to guided landing mode', () => {
  assert.deepEqual(resolveAllBeansEntryState({}, 'guided'), {
    landingMode: 'guided',
  });
});

test('resolveAllBeansEntryState maps entry intent direct to direct landing mode', () => {
  assert.deepEqual(resolveAllBeansEntryState({}, 'direct'), {
    landingMode: 'direct',
  });
});

test('resolveAllBeansEntryState falls back to route params when no intent', () => {
  assert.deepEqual(resolveAllBeansEntryState({ tab: 'new' }, null), {
    landingMode: 'default',
  });
});
