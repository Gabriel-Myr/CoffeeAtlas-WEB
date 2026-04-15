import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('app config registers the onboarding guided page', () => {
  const source = readFileSync(
    new URL('../src/app.config.ts', import.meta.url),
    'utf8'
  );

  assert.match(source, /'pages\/onboarding-guided\/index'/);
});
