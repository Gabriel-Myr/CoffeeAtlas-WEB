import assert from 'node:assert/strict';
import test from 'node:test';

import { buildChecks } from '../scripts/smoke-v1-core.mjs';

test('buildChecks includes wechat login route existence probe for unauthenticated smoke', () => {
  const checks = buildChecks('');
  const wechatLoginCheck = checks.find((check) => check.name === 'wechat login route');

  assert.ok(wechatLoginCheck);
  assert.equal(wechatLoginCheck?.method, 'POST');
  assert.equal(wechatLoginCheck?.path, '/api/v1/auth/wechat/login');
  assert.deepEqual(wechatLoginCheck?.expectedStatuses, [400, 401, 500, 502]);
});

test('buildChecks keeps auth-only checks behind AUTH_TOKEN', () => {
  const withoutToken = buildChecks('');
  const withToken = buildChecks('demo-token');

  assert.equal(withoutToken.some((check) => check.name === 'current user'), false);
  assert.equal(withToken.some((check) => check.name === 'current user'), true);
  assert.equal(withToken.some((check) => check.name === 'favorites'), true);
});
