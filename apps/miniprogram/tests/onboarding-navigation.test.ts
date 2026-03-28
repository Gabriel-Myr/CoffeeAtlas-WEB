import assert from 'node:assert/strict';
import test from 'node:test';

import { createOnboardingFlow } from '../src/pages/onboarding/onboarding-logic.ts';
import { resolveOnboardingNavigation } from '../src/pages/onboarding/navigation.ts';

test('beginner onboarding resolves to guided relaunch action', () => {
  const flow = createOnboardingFlow(
    {
      getProfile: () => null,
      setProfile: () => {},
    },
    () => 1711111111
  );

  assert.deepEqual(resolveOnboardingNavigation(flow.complete('beginner')), {
    type: 'reLaunch',
    url: '/pages/all-beans/index',
    entryIntent: 'guided',
  });
});

test('intermediate onboarding resolves to direct all-beans relaunch action', () => {
  const flow = createOnboardingFlow(
    {
      getProfile: () => null,
      setProfile: () => {},
    },
    () => 1711111111
  );

  assert.deepEqual(resolveOnboardingNavigation(flow.complete('intermediate')), {
    type: 'reLaunch',
    url: '/pages/all-beans/index',
    entryIntent: 'direct',
  });
});

test('skipping onboarding resolves to index relaunch action without entry intent', () => {
  const flow = createOnboardingFlow(
    {
      getProfile: () => null,
      setProfile: () => {},
    },
    () => 1711111111
  );

  assert.deepEqual(resolveOnboardingNavigation(flow.skip()), {
    type: 'reLaunch',
    url: '/pages/index/index',
    entryIntent: null,
  });
});
