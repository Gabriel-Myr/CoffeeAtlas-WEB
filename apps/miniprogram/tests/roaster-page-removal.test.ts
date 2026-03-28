import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

test('app config no longer registers the roasters page or tab', () => {
  const appConfigSource = readFileSync(
    path.join(projectRoot, 'src/app.config.ts'),
    'utf8'
  );

  assert.doesNotMatch(appConfigSource, /pages\/roasters\/index/);
  assert.doesNotMatch(appConfigSource, /text:\s*'烘焙商'/);
});

test('standalone roasters page files have been removed', () => {
  assert.equal(
    existsSync(path.join(projectRoot, 'src/pages/roasters/index.tsx')),
    false
  );
  assert.equal(
    existsSync(path.join(projectRoot, 'src/pages/roasters/index.scss')),
    false
  );
  assert.equal(
    existsSync(path.join(projectRoot, 'src/pages/roasters/index.config.ts')),
    false
  );
});
