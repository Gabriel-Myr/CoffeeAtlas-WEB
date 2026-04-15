import assert from 'node:assert/strict';
import test from 'node:test';

import { createGuidedSeedStore } from '../src/pages/all-beans/guided-seed-store.ts';

test('guided seed store returns stored state once and clears it', () => {
  let stored: unknown = null;
  const store = createGuidedSeedStore({
    get: () => stored,
    set: (state) => {
      stored = state;
    },
    remove: () => {
      stored = null;
    },
  });

  store.setState({
    processBase: 'natural',
    processStyle: 'anaerobic',
    continent: 'africa',
    country: '埃塞俄比亚',
    variety: null,
  });

  assert.deepEqual(store.consumeState(), {
    processBase: 'natural',
    processStyle: 'anaerobic',
    continent: 'africa',
    country: '埃塞俄比亚',
    variety: null,
  });
  assert.equal(store.consumeState(), null);
});

test('guided seed store clears invalid values', () => {
  let stored: unknown = 'unknown';
  const store = createGuidedSeedStore({
    get: () => stored,
    set: (choice) => {
      stored = choice;
    },
    remove: () => {
      stored = null;
    },
  });

  assert.equal(store.consumeState(), null);
  assert.equal(stored, null);
});
