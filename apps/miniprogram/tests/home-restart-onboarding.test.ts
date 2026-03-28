import assert from 'node:assert/strict';
import test from 'node:test';

import { ONBOARDING_PAGE_URL, restartOnboarding } from '../src/pages/index/restart-onboarding.ts';

test('restartOnboarding clears profile before relaunching onboarding page', () => {
  const events: string[] = [];

  restartOnboarding({
    clearProfile: () => {
      events.push('clear');
    },
    relaunch: (url) => {
      events.push(`relaunch:${url}`);
    },
  });

  assert.deepEqual(events, ['clear', `relaunch:${ONBOARDING_PAGE_URL}`]);
});
