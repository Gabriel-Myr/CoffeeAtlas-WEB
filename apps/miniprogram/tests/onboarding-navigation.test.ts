import assert from 'node:assert/strict';
import test from 'node:test';

import { createOnboardingFlow } from '../src/pages/onboarding/onboarding-logic.ts';
import { resolveOnboardingNavigation } from '../src/pages/onboarding/navigation.ts';

test('beginner onboarding resolves to guided tab action', () => {
  const flow = createOnboardingFlow(
    {
      getProfile: () => null,
      setProfile: () => {},
    },
    () => 1711111111
  );

  assert.deepEqual(resolveOnboardingNavigation(flow.complete('beginner')), {
    type: 'switchTab',
    url: '/pages/all-beans/index',
    entryIntent: 'guided',
  });
});

test('intermediate onboarding resolves to index tab action without entry intent', () => {
  const flow = createOnboardingFlow(
    {
      getProfile: () => null,
      setProfile: () => {},
    },
    () => 1711111111
  );

  assert.deepEqual(resolveOnboardingNavigation(flow.complete('intermediate')), {
    type: 'switchTab',
    url: '/pages/index/index',
    entryIntent: null,
  });
});

test('skipping onboarding resolves to index tab action without entry intent', () => {
  const flow = createOnboardingFlow(
    {
      getProfile: () => null,
      setProfile: () => {},
    },
    () => 1711111111
  );

  assert.deepEqual(resolveOnboardingNavigation(flow.skip()), {
    type: 'switchTab',
    url: '/pages/index/index',
    entryIntent: null,
  });
});
