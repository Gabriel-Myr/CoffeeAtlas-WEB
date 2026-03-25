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
    '会先进入探索首页，你可以从快捷入口继续进入发现区，自行筛选目标豆子。'
  );
});

test('default onboarding note helps users choose a path', () => {
  assert.equal(
    getOnboardingSelectionNote(null),
    '如果你还不熟悉咖啡豆，就先走引导入口；已经有目标的话，可以直接筛选。'
  );
});
