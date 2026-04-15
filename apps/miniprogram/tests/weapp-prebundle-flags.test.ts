import assert from 'node:assert/strict';
import test from 'node:test';

import {
  injectTaroRuntimeFeatureFlags,
  patchWeappPrebundleSource,
} from '../scripts/weapp-prebundle-flags.mjs';

test('injectTaroRuntimeFeatureFlags prepends missing taro runtime feature flags', () => {
  const source = 'if (ENABLE_INNER_HTML) { foo(); }\nif (ENABLE_CONTAINS) { bar(); }\n';
  const result = injectTaroRuntimeFeatureFlags(source);

  assert.match(result, /^const ENABLE_(?:[A-Z_]+) = false;\nconst ENABLE_(?:[A-Z_]+) = false;\n/);
  assert.match(result, /const ENABLE_INNER_HTML = false;/);
  assert.match(result, /const ENABLE_CONTAINS = false;/);
  assert.match(result, /if \(ENABLE_INNER_HTML\) { foo\(\); }/);
});

test('injectTaroRuntimeFeatureFlags keeps already defined flags untouched', () => {
  const source = 'const ENABLE_INNER_HTML = true;\nif (ENABLE_INNER_HTML) { foo(); }\n';
  const result = injectTaroRuntimeFeatureFlags(source);

  assert.equal(result, source);
});

test('injectTaroRuntimeFeatureFlags leaves unrelated content unchanged', () => {
  const source = 'console.log("hello");\n';
  const result = injectTaroRuntimeFeatureFlags(source);

  assert.equal(result, source);
});

test('patchWeappPrebundleSource normalizes react wrapper interop exports', () => {
  const source = [
    "var m = require('./react.core.js');",
    '                   module.exports = m.default;',
    '                   exports.default = module.exports;',
  ].join('\n');

  const result = patchWeappPrebundleSource(source);

  assert.equal(
    result,
    "var m = require('./react.core.js');\nmodule.exports = m.default || m;\nexports.default = module.exports;\n"
  );
});
