import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');
const conflictMarkerPattern = /^(<<<<<<<|=======|>>>>>>>)/m;

test('all-beans page source does not contain merge conflict markers', () => {
  const pageSource = readFileSync(
    path.join(projectRoot, 'src/pages/all-beans/index.tsx'),
    'utf8'
  );

  assert.doesNotMatch(pageSource, conflictMarkerPattern);
});

test('all-beans page styles do not contain merge conflict markers', () => {
  const styleSource = readFileSync(
    path.join(projectRoot, 'src/pages/all-beans/index.scss'),
    'utf8'
  );

  assert.doesNotMatch(styleSource, conflictMarkerPattern);
});
