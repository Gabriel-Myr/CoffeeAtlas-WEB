import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveAllBeansDidShowTransition } from '../src/pages/all-beans/entry-transition.ts';

test('guided entry updates landing mode and requests page reset', () => {
  assert.deepEqual(
    resolveAllBeansDidShowTransition({
      params: null,
      entryIntent: 'guided',
      landingMode: 'default',
    }),
    {
      shouldApply: true,
      nextLandingMode: 'guided',
      shouldResetPageState: true,
    }
  );
});

test('direct entry keeps direct landing mode and resets page state', () => {
  assert.deepEqual(
    resolveAllBeansDidShowTransition({
      params: null,
      entryIntent: 'direct',
      landingMode: 'guided',
    }),
    {
      shouldApply: true,
      nextLandingMode: 'direct',
      shouldResetPageState: true,
    }
  );
});

test('missing entry intent produces no didShow transition', () => {
  assert.deepEqual(
    resolveAllBeansDidShowTransition({
      params: { tab: 'discover' },
      entryIntent: null,
      landingMode: 'default',
    }),
    {
      shouldApply: false,
      nextLandingMode: 'default',
      shouldResetPageState: false,
    }
  );
});
