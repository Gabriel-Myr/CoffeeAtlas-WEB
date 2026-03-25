import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveAllBeansDidShowTransition } from '../src/pages/all-beans/entry-transition.ts';

test('guided entry from another tab switches back to discover and preserves guided landing mode', () => {
  assert.deepEqual(
    resolveAllBeansDidShowTransition({
      params: null,
      entryIntent: 'guided',
      activeTab: 'sales',
      landingMode: 'default',
    }),
    {
      shouldApply: true,
      nextActiveTab: 'discover',
      nextLandingMode: 'guided',
      shouldChangeTab: true,
      shouldResetPageState: true,
    }
  );
});

test('guided entry on discover tab still updates landing mode without changing tab', () => {
  assert.deepEqual(
    resolveAllBeansDidShowTransition({
      params: null,
      entryIntent: 'guided',
      activeTab: 'discover',
      landingMode: 'default',
    }),
    {
      shouldApply: true,
      nextActiveTab: 'discover',
      nextLandingMode: 'guided',
      shouldChangeTab: false,
      shouldResetPageState: true,
    }
  );
});

test('new entry switches to new tab with default landing mode', () => {
  assert.deepEqual(
    resolveAllBeansDidShowTransition({
      params: null,
      entryIntent: 'new',
      activeTab: 'discover',
      landingMode: 'guided',
    }),
    {
      shouldApply: true,
      nextActiveTab: 'new',
      nextLandingMode: 'default',
      shouldChangeTab: true,
      shouldResetPageState: true,
    }
  );
});

test('direct entry switches to discover, keeps direct landing mode, and resets page state', () => {
  assert.deepEqual(
    resolveAllBeansDidShowTransition({
      params: null,
      entryIntent: 'direct',
      activeTab: 'discover',
      landingMode: 'guided',
    }),
    {
      shouldApply: true,
      nextActiveTab: 'discover',
      nextLandingMode: 'direct',
      shouldChangeTab: false,
      shouldResetPageState: true,
    }
  );
});

test('missing entry intent produces no didShow transition', () => {
  assert.deepEqual(
    resolveAllBeansDidShowTransition({
      params: { tab: 'discover' },
      entryIntent: null,
      activeTab: 'discover',
      landingMode: 'default',
    }),
    {
      shouldApply: false,
      nextActiveTab: 'discover',
      nextLandingMode: 'default',
      shouldChangeTab: false,
      shouldResetPageState: false,
    }
  );
});
