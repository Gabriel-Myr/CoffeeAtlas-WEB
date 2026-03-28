import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

test('profile page no longer exposes the connection debug entry', () => {
  const profileSource = readFileSync(
    path.join(projectRoot, 'src/pages/profile/index.tsx'),
    'utf8'
  );

  assert.doesNotMatch(profileSource, /\/pages\/debug\/index/);
  assert.doesNotMatch(profileSource, /连接诊断/);
  assert.doesNotMatch(profileSource, /profile__debug-card/);
});

test('app config no longer registers the debug page', () => {
  const appConfigSource = readFileSync(
    path.join(projectRoot, 'src/app.config.ts'),
    'utf8'
  );

  assert.doesNotMatch(appConfigSource, /pages\/debug\/index/);
});
