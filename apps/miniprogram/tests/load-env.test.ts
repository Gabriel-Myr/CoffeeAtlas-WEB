import assert from 'node:assert/strict';
import test from 'node:test';

import { parseEnvFile } from '../config/load-env.ts';

test('parseEnvFile reads env entries and strips comments', () => {
  const parsed = parseEnvFile(`
# comment
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-anon-key # inline comment
IGNORED_LINE
`);

  assert.deepEqual(parsed, {
    NEXT_PUBLIC_SUPABASE_URL: 'https://demo.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'demo-anon-key',
  });
});

test('parseEnvFile preserves quoted values', () => {
  const parsed = parseEnvFile(`
QUOTED_SINGLE='single quoted value'
QUOTED_DOUBLE="line one\\nline two"
`);

  assert.equal(parsed.QUOTED_SINGLE, 'single quoted value');
  assert.equal(parsed.QUOTED_DOUBLE, 'line one\nline two');
});
