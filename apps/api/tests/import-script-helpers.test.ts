import test from 'node:test';
import assert from 'node:assert/strict';

import { parseImportArgs } from '../scripts/import-script-helpers.ts';

test('parseImportArgs requires input for sales-style scripts', () => {
  assert.throws(
    () => parseImportArgs([], { scriptName: 'import-sales.ts', allowInput: true }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /Missing required argument: --input/);
      assert.match(error.message, /Usage: import-sales\.ts --input <file>/);
      return true;
    }
  );
});

test('parseImportArgs resolves input paths when provided', () => {
  const parsed = parseImportArgs(['--input', './fixtures/sales.xlsx'], {
    scriptName: 'import-sales.ts',
    allowInput: true,
  });

  assert.equal(typeof parsed.input, 'string');
  assert.ok(parsed.input?.endsWith('/fixtures/sales.xlsx'));
});

test('parseImportArgs rejects unexpected input for scripts without file args', () => {
  assert.throws(
    () => parseImportArgs(['--input', './fixtures/roasters.json'], { scriptName: 'import-roasters.ts', allowInput: false }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /does not accept --input/);
      assert.match(error.message, /Usage: import-roasters\.ts/);
      return true;
    }
  );
});

test('parseImportArgs rejects unknown flags', () => {
  assert.throws(
    () => parseImportArgs(['--wat'], { scriptName: 'import-beans.ts', allowInput: false }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /Unknown argument: --wat/);
      assert.match(error.message, /Usage: import-beans\.ts/);
      return true;
    }
  );
});
