import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const SOURCE_ROOT = path.resolve(import.meta.dirname, '../src');
const DISALLOWED_IMPORT_FRAGMENT = 'packages/shared-types/src';

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (!entry.isFile()) continue;
    if (!/\.(ts|tsx)$/.test(entry.name)) continue;
    files.push(fullPath);
  }

  return files;
}

test('miniprogram source imports shared-types through package entry only', () => {
  const violations = collectSourceFiles(SOURCE_ROOT)
    .filter((filePath) => statSync(filePath).isFile())
    .filter((filePath) => readFileSync(filePath, 'utf8').includes(DISALLOWED_IMPORT_FRAGMENT))
    .map((filePath) => path.relative(path.resolve(import.meta.dirname, '..'), filePath));

  assert.deepEqual(
    violations,
    [],
    `Found disallowed source imports that bypass package exports: ${violations.join(', ')}`
  );
});
