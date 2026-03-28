import assert from 'node:assert/strict';
import test from 'node:test';

import { createEntryIntentStore } from '../src/pages/all-beans/entry-intent-store.ts';

test('setIntent stores entry intent for all-beans', () => {
  let stored: unknown = null;
  const store = createEntryIntentStore({
    get: () => stored,
    set: (value) => {
      stored = value;
    },
    remove: () => {
      stored = null;
    },
  });

  store.setIntent('guided');

  assert.equal(stored, 'guided');
});

test('consumeIntent returns intent and clears storage', () => {
  let stored: unknown = 'direct';
  const store = createEntryIntentStore({
    get: () => stored,
    set: (value) => {
      stored = value;
    },
    remove: () => {
      stored = null;
    },
  });

  assert.equal(store.consumeIntent(), 'direct');
  assert.equal(stored, null);
});

test('consumeIntent clears invalid stored values', () => {
  let stored: unknown = 'unexpected';
  let removed = false;

  const store = createEntryIntentStore({
    get: () => stored,
    set: (value) => {
      stored = value;
    },
    remove: () => {
      removed = true;
      stored = null;
    },
  });

  assert.equal(store.consumeIntent(), null);
  assert.equal(removed, true);
  assert.equal(stored, null);
});
