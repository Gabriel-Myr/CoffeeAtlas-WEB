import assert from 'node:assert/strict';
import test from 'node:test';

import { getOnboardingSelectionNote, ONBOARDING_OPTION_COPY } from '../src/pages/onboarding/copy.ts';

test('onboarding copy makes beginner and intermediate paths clearly different', () => {
  assert.deepEqual(ONBOARDING_OPTION_COPY, {
    beginner: {
      label: '新手',
      meta: '不懂产地也能开始',
    },
    intermediate: {
      label: '有一点经验',
      meta: '自己筛选目标豆子',
    },
  });
});

test('beginner selection note explains guided narrowing flow', () => {
  assert.equal(
    getOnboardingSelectionNote('beginner'),
    '会先进入更轻松的引导入口，先定方向，再逐步缩小到合适豆单。'
  );
});

test('intermediate selection note explains direct filtering flow', () => {
  assert.equal(
    getOnboardingSelectionNote('intermediate'),
    '会进入同一个发现页，引导卡默认收起；需要时再展开，用自己的节奏筛选豆子。'
  );
});

test('default onboarding note helps users choose a path', () => {
  assert.equal(
    getOnboardingSelectionNote(null),
    '两种方式都会进入同一个发现页，只是默认引导强度不同。'
  );
});
