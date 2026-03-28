import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildImportantLogBlock,
  createRestartCoordinator,
  shouldRestartForPath,
  WATCHED_PATHS,
} from '../../../scripts/miniprogram-auto-repush.mjs';

test('WATCHED_PATHS includes miniprogram and shared package directories', () => {
  assert.deepEqual(WATCHED_PATHS, [
    'apps/miniprogram',
    'packages/shared-types',
    'packages/api-client',
    'packages/domain',
  ]);
});

test('shouldRestartForPath only reacts to watched source changes', () => {
  assert.equal(shouldRestartForPath('apps/miniprogram/src/pages/index/index.tsx'), true);
  assert.equal(shouldRestartForPath('packages/shared-types/src/index.ts'), true);
  assert.equal(shouldRestartForPath('packages/domain/src/index.ts'), true);

  assert.equal(shouldRestartForPath('apps/api/app/api/v1/health/route.ts'), false);
  assert.equal(shouldRestartForPath('apps/miniprogram/dist/app.js'), false);
  assert.equal(shouldRestartForPath('packages/api-client/dist/index.js'), false);
});

test('restart coordinator coalesces burst changes into one restart', async () => {
  const reasons: string[] = [];
  const coordinator = createRestartCoordinator({
    delayMs: 20,
    onRestart: (reason) => reasons.push(reason),
  });

  coordinator.schedule('apps/miniprogram/src/pages/index/index.tsx');
  coordinator.schedule('apps/miniprogram/src/pages/profile/index.tsx');
  coordinator.schedule('packages/shared-types/src/index.ts');

  await new Promise((resolve) => setTimeout(resolve, 60));

  assert.equal(reasons.length, 1);
  assert.equal(reasons[0], 'packages/shared-types/src/index.ts');
});

test('restart coordinator ignores unrelated file changes', async () => {
  const reasons: string[] = [];
  const coordinator = createRestartCoordinator({
    delayMs: 20,
    onRestart: (reason) => reasons.push(reason),
  });

  coordinator.schedule('apps/api/app/api/v1/health/route.ts');

  await new Promise((resolve) => setTimeout(resolve, 60));

  assert.equal(reasons.length, 0);
});

test('buildImportantLogBlock renders an easy-to-spot separator block', () => {
  const block = buildImportantLogBlock('检测到改动，准备重推 Taro');

  assert.equal(block.includes('=============================='), true);
  assert.equal(block.includes('检测到改动，准备重推 Taro'), true);
});
