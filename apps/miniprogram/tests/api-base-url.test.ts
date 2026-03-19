import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getApiBaseUrlValidationError,
  normalizeApiBaseUrl,
} from '../src/utils/api-base-url.ts';

test('normalizeApiBaseUrl trims trailing slash and /api suffix', () => {
  assert.equal(
    normalizeApiBaseUrl(' https://coffee-atlas-web-web.vercel.app/api/ '),
    'https://coffee-atlas-web-web.vercel.app'
  );
});

test('getApiBaseUrlValidationError explains common vercel domain typo', () => {
  assert.equal(
    getApiBaseUrlValidationError('https://coffee-atlas-web-web-vercel-app'),
    'API 地址看起来写错了：你可能把 `.vercel.app` 写成了 `-vercel-app`。请改成类似 `https://你的项目.vercel.app`。'
  );
});

test('getApiBaseUrlValidationError accepts valid https cloud domain', () => {
  assert.equal(
    getApiBaseUrlValidationError('https://coffee-atlas-web-web.vercel.app'),
    null
  );
});
