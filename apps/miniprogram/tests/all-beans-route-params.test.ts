import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveAllBeansEntryState, resolveAllBeansRouteParams } from '../src/pages/all-beans/route-params.ts';

test('resolveAllBeansRouteParams sets active tab from tab=new', () => {
  assert.deepEqual(resolveAllBeansRouteParams({ tab: 'new' }), {
    activeTab: 'new',
    landingMode: 'default',
  });
});

test('resolveAllBeansRouteParams maps entry=guided to discover landing mode', () => {
  assert.deepEqual(resolveAllBeansRouteParams({ entry: 'guided' }), {
    activeTab: 'discover',
    landingMode: 'guided',
  });
});

test('resolveAllBeansRouteParams maps entry=direct to discover landing mode', () => {
  assert.deepEqual(resolveAllBeansRouteParams({ entry: 'direct' }), {
    activeTab: 'discover',
    landingMode: 'direct',
  });
});

test('resolveAllBeansEntryState maps entry intent new to new tab', () => {
  assert.deepEqual(resolveAllBeansEntryState({}, 'new'), {
    activeTab: 'new',
    landingMode: 'default',
  });
});

test('resolveAllBeansEntryState maps entry intent guided to discover guided', () => {
  assert.deepEqual(resolveAllBeansEntryState({}, 'guided'), {
    activeTab: 'discover',
    landingMode: 'guided',
  });
});

test('resolveAllBeansEntryState falls back to route params when no intent', () => {
  assert.deepEqual(resolveAllBeansEntryState({ tab: 'new' }, null), {
    activeTab: 'new',
    landingMode: 'default',
  });
});
