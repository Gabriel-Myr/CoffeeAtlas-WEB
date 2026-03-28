import assert from 'node:assert/strict';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('shared-types dist entry is loadable in Node ESM runtime', async () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const moduleUrl = pathToFileURL(
    path.resolve(testDir, '../../../packages/shared-types/dist/index.js')
  ).href;

  const mod = await import(moduleUrl);

  assert.equal(typeof mod, 'object');
});
