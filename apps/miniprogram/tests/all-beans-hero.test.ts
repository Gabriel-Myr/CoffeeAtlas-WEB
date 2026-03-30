import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');
const pageSource = readFileSync(
  path.join(projectRoot, 'src/pages/all-beans/index.tsx'),
  'utf8'
);

test('all-beans page imports the shared AtlasPageHero component', () => {
  assert.match(pageSource, /import AtlasPageHero from '\.\.\/\.\.\/components\/AtlasPageHero';/);
});

test('all-beans page renders the shared AtlasPageHero at the top', () => {
  assert.match(pageSource, /<AtlasPageHero subtitle="全部咖啡豆">/);
});
