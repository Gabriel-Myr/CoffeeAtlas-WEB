import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveAllBeansEntryBootstrap } from '../src/pages/all-beans/entry-bootstrap.ts';

test('entry bootstrap keeps guided seed when page state needs reset', () => {
  const seed = {
    processBase: 'washed',
    processStyle: 'traditional',
    continent: 'africa',
    country: '埃塞俄比亚',
    variety: null,
  };

  assert.deepEqual(
    resolveAllBeansEntryBootstrap({
      guidedSeed: seed,
      transition: {
        shouldApply: true,
        nextLandingMode: 'guided',
        shouldResetPageState: true,
      },
    }),
    {
      shouldResetPageState: true,
      nextPendingGuidedSeed: seed,
    }
  );
});

test('entry bootstrap keeps null seed unchanged', () => {
  assert.deepEqual(
    resolveAllBeansEntryBootstrap({
      guidedSeed: null,
      transition: {
        shouldApply: true,
        nextLandingMode: 'guided',
        shouldResetPageState: true,
      },
    }),
    {
      shouldResetPageState: true,
      nextPendingGuidedSeed: null,
    }
  );
});
