import assert from 'node:assert/strict';
import test from 'node:test';

import { createOnboardingFlow } from '../src/pages/onboarding/onboarding-logic.ts';

test('onboarding load redirects when profile exists', () => {
  const flow = createOnboardingFlow(
    {
      getProfile: () => ({ experienceLevel: 'beginner', completedAt: 1700000000 }),
      setProfile: () => {},
    },
    () => 1711111111
  );

  assert.equal(flow.getRedirectUrl(), '/pages/index/index');
});

test('completing onboarding writes profile and routes beginner to the guided onboarding page', () => {
  let storedProfile: { experienceLevel: string; completedAt: number } | null = null;
  const flow = createOnboardingFlow(
    {
      getProfile: () => storedProfile,
      setProfile: (profile) => {
        storedProfile = profile;
      },
    },
    () => 1711111111
  );

  const result = flow.complete('beginner');

  assert.deepEqual(storedProfile, {
    experienceLevel: 'beginner',
    completedAt: 1711111111,
  });
  assert.equal(result.url, '/pages/onboarding-guided/index');
  assert.equal(result.entryIntent, null);
});

test('completing onboarding routes intermediate to direct all-beans entry', () => {
  const flow = createOnboardingFlow(
    {
      getProfile: () => null,
      setProfile: () => {},
    },
    () => 1711111111
  );

  const result = flow.complete('intermediate');

  assert.equal(result.url, '/pages/all-beans/index?entry=direct');
  assert.equal(result.entryIntent, 'direct');
});

test('skipping onboarding does not write profile and routes to index', () => {
  let setCalls = 0;
  const flow = createOnboardingFlow(
    {
      getProfile: () => null,
      setProfile: () => {
        setCalls += 1;
      },
    },
    () => 1711111111
  );

  const result = flow.skip();

  assert.equal(setCalls, 0);
  assert.equal(result.url, '/pages/index/index');
  assert.equal(result.entryIntent, null);
});
