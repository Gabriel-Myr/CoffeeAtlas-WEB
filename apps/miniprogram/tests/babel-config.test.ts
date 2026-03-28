import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(testDir, '..');

test('babel config uses .cjs in the ESM miniprogram package', () => {
  assert.equal(existsSync(path.join(appDir, 'babel.config.cjs')), true);
  assert.equal(existsSync(path.join(appDir, 'babel.config.js')), false);
});
