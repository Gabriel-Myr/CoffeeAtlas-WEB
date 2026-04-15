import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const MINIPROGRAM_ROOT = path.resolve(import.meta.dirname, '..');
const CATALOG_SERVICE_FILE = path.join(MINIPROGRAM_ROOT, 'src/services/catalog-supabase.ts');
const CATALOG_SHARED_FILE = path.join(MINIPROGRAM_ROOT, 'src/services/catalog-supabase/shared.ts');
const API_SERVICE_FILE = path.join(MINIPROGRAM_ROOT, 'src/services/api.ts');

test('catalog supabase entry file stays as a small barrel instead of a 1000+ line module', () => {
  const source = readFileSync(CATALOG_SERVICE_FILE, 'utf8');
  const lineCount = source.split(/\r?\n/).length;

  assert.ok(
    lineCount < 200,
    `Expected catalog-supabase.ts to stay below 200 lines after modular split, got ${lineCount}`
  );
  assert.match(source, /export \* from ['"]\.\/catalog-supabase\//);
});

test('catalog shared barrel stays below 200 lines and delegates to focused modules', () => {
  const source = readFileSync(CATALOG_SHARED_FILE, 'utf8');
  const lineCount = source.split(/\r?\n/).length;

  assert.ok(
    lineCount < 200,
    `Expected catalog-supabase/shared.ts to stay below 200 lines after deeper split, got ${lineCount}`
  );
  assert.match(source, /export \* from ['"]\.\/shared-core(\.ts)?['"]/);
  assert.match(source, /export \* from ['"]\.\/shared-(mappers|discover|roasters)(\.ts)?['"]/);
});

test('catalog shared core shrinks after helper extraction', () => {
  const source = readFileSync(path.join(MINIPROGRAM_ROOT, 'src/services/catalog-supabase/shared-core.ts'), 'utf8');
  const lineCount = source.split(/\r?\n/).length;

  assert.ok(
    lineCount < 650,
    `Expected catalog-supabase/shared-core.ts to stay below 650 lines after helper extraction, got ${lineCount}`
  );
});

test('api service reuses shared query param aliases instead of redefining catalog query objects inline', () => {
  const source = readFileSync(API_SERVICE_FILE, 'utf8');

  assert.ok(source.includes('BeansQueryParams'));
  assert.ok(source.includes('BeanDiscoverQueryParams'));
  assert.ok(source.includes('RoastersQueryParams'));
  assert.ok(!source.includes('export async function getBeans(params?: {'));
  assert.ok(!source.includes('export async function getBeanDiscover(params?: {'));
  assert.ok(!source.includes('export async function getRoasters(params?: {'));
});
