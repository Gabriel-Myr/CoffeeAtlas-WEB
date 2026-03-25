import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGuidedDiscoverStep,
  resolveLandingModeAfterTabChange,
  resolveGuidedContinentSelection,
  resolveGuidedProcessSelection,
  type GuidedContinentChoiceId,
  type GuidedProcessChoiceId,
} from '../src/pages/all-beans/guided-discover.ts';

const PROCESS_OPTIONS = [
  { id: 'washed', label: '水洗', count: 12 },
  { id: 'natural', label: '日晒', count: 8 },
  { id: 'anaerobic', label: '厌氧发酵', count: 4 },
];

const CONTINENT_OPTIONS = [
  { id: 'africa', label: '非洲', count: 10 },
  { id: 'americas', label: '美洲', count: 18 },
  { id: 'asia', label: '亚洲', count: 6 },
];

test('resolveGuidedProcessSelection maps clean choice to washed-like options first', () => {
  const selection = resolveGuidedProcessSelection('clean' satisfies GuidedProcessChoiceId, PROCESS_OPTIONS);

  assert.deepEqual(selection, {
    id: 'washed',
    label: '水洗',
  });
});

test('resolveGuidedProcessSelection maps fruity choice to natural-like options first', () => {
  const selection = resolveGuidedProcessSelection('fruity' satisfies GuidedProcessChoiceId, PROCESS_OPTIONS);

  assert.deepEqual(selection, {
    id: 'natural',
    label: '日晒',
  });
});

test('resolveGuidedProcessSelection maps adventurous choice to experimental options first', () => {
  const selection = resolveGuidedProcessSelection('adventurous' satisfies GuidedProcessChoiceId, PROCESS_OPTIONS);

  assert.deepEqual(selection, {
    id: 'anaerobic',
    label: '厌氧发酵',
  });
});

test('resolveGuidedProcessSelection returns null when preferred labels are missing', () => {
  const selection = resolveGuidedProcessSelection('clean' satisfies GuidedProcessChoiceId, [
    { id: 'honey', label: '蜜处理', count: 5 },
  ]);

  assert.equal(selection, null);
});

test('resolveGuidedContinentSelection maps floral choice to africa', () => {
  const selection = resolveGuidedContinentSelection('floral' satisfies GuidedContinentChoiceId, CONTINENT_OPTIONS);

  assert.deepEqual(selection, {
    id: 'africa',
    label: '非洲',
  });
});

test('resolveGuidedContinentSelection maps balanced choice to americas', () => {
  const selection = resolveGuidedContinentSelection('balanced' satisfies GuidedContinentChoiceId, CONTINENT_OPTIONS);

  assert.deepEqual(selection, {
    id: 'americas',
    label: '美洲',
  });
});

test('resolveGuidedContinentSelection maps bold choice to asia', () => {
  const selection = resolveGuidedContinentSelection('bold' satisfies GuidedContinentChoiceId, CONTINENT_OPTIONS);

  assert.deepEqual(selection, {
    id: 'asia',
    label: '亚洲',
  });
});

test('buildGuidedDiscoverStep starts from process question', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcess: 'all',
      selectedContinent: 'all',
      selectedCountry: 'all',
    }),
    {
      step: 'process',
      title: '先告诉我你更想从哪种杯感开始',
      description: '我会先帮你定一个处理法方向，再继续缩小到更适合的产地区域。',
    }
  );
});

test('buildGuidedDiscoverStep moves to continent question after process is selected', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcess: 'washed',
      selectedContinent: 'all',
      selectedCountry: 'all',
    }),
    {
      step: 'continent',
      title: '下一步，选一个更接近你期待风味的区域',
      description: '处理法已经帮你定好了，现在再用产地区域把结果继续缩小。',
    }
  );
});

test('buildGuidedDiscoverStep finishes once continent is selected even if process stays all', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcess: 'all',
      selectedContinent: 'africa',
      selectedCountry: 'all',
    }),
    {
      step: 'done',
      title: '已经帮你缩小到一条可直接浏览的路径',
      description: '你可以直接往下看推荐和豆单，也可以重新回答一次，换一条路线。',
    }
  );
});

test('buildGuidedDiscoverStep finishes once continent or country is selected', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcess: 'washed',
      selectedContinent: 'africa',
      selectedCountry: 'all',
    }),
    {
      step: 'done',
      title: '已经帮你缩小到一条可直接浏览的路径',
      description: '你可以直接往下看推荐和豆单，也可以重新回答一次，换一条路线。',
    }
  );
});

test('resolveLandingModeAfterTabChange resets guided mode for manual tab changes', () => {
  assert.equal(resolveLandingModeAfterTabChange({ currentMode: 'guided', preserveLandingMode: false }), 'default');
});

test('resolveLandingModeAfterTabChange keeps current mode for entry-driven tab updates', () => {
  assert.equal(resolveLandingModeAfterTabChange({ currentMode: 'guided', preserveLandingMode: true }), 'guided');
});

test('resolveLandingModeAfterTabChange prefers explicit next mode for entry-driven updates', () => {
  assert.equal(
    resolveLandingModeAfterTabChange({
      currentMode: 'default',
      preserveLandingMode: true,
      nextMode: 'guided',
    }),
    'guided'
  );
});
