import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGuidedDiscoverStep,
  resolveGuidedContinentSelection,
  resolveGuidedProcessSelection,
  resolveGuidedProcessStyleSelection,
  shouldExpandGuidedDiscoverCard,
  shouldShowGuidedDiscoverCard,
  type GuidedContinentChoiceId,
  type GuidedProcessChoiceId,
  type GuidedProcessStyleChoiceId,
} from '../src/pages/all-beans/guided-discover.ts';

const PROCESS_BASE_OPTIONS = [
  { id: 'washed', label: '水洗', count: 12 },
  { id: 'natural', label: '日晒', count: 8 },
  { id: 'honey', label: '蜜处理', count: 6 },
];

const PROCESS_STYLE_OPTIONS = [
  { id: 'traditional', label: '传统', count: 18 },
  { id: 'anaerobic', label: '厌氧', count: 4 },
  { id: 'yeast', label: '酵母', count: 2 },
];

const CONTINENT_OPTIONS = [
  { id: 'africa', label: '非洲', count: 10 },
  { id: 'americas', label: '美洲', count: 18 },
  { id: 'asia', label: '亚洲', count: 6 },
];

test('resolveGuidedProcessSelection maps clean choice to washed-like options first', () => {
  const selection = resolveGuidedProcessSelection('clean' satisfies GuidedProcessChoiceId, PROCESS_BASE_OPTIONS);

  assert.deepEqual(selection, {
    id: 'washed',
    label: '水洗',
  });
});

test('resolveGuidedProcessSelection maps fruity choice to natural-like options first', () => {
  const selection = resolveGuidedProcessSelection('fruity' satisfies GuidedProcessChoiceId, PROCESS_BASE_OPTIONS);

  assert.deepEqual(selection, {
    id: 'natural',
    label: '日晒',
  });
});

test('resolveGuidedProcessSelection maps sweet choice to honey-like options first', () => {
  const selection = resolveGuidedProcessSelection('sweet' satisfies GuidedProcessChoiceId, PROCESS_BASE_OPTIONS);

  assert.deepEqual(selection, {
    id: 'honey',
    label: '蜜处理',
  });
});

test('resolveGuidedProcessSelection returns null when preferred labels are missing', () => {
  const selection = resolveGuidedProcessSelection('clean' satisfies GuidedProcessChoiceId, [
    { id: 'other', label: '其他', count: 5 },
  ]);

  assert.equal(selection, null);
});

test('resolveGuidedProcessStyleSelection maps classic choice to traditional first', () => {
  const selection = resolveGuidedProcessStyleSelection(
    'classic' satisfies GuidedProcessStyleChoiceId,
    PROCESS_STYLE_OPTIONS
  );

  assert.deepEqual(selection, {
    id: 'traditional',
    label: '传统',
  });
});

test('resolveGuidedProcessStyleSelection maps anaerobic choice to anaerobic first', () => {
  const selection = resolveGuidedProcessStyleSelection(
    'anaerobic' satisfies GuidedProcessStyleChoiceId,
    PROCESS_STYLE_OPTIONS
  );

  assert.deepEqual(selection, {
    id: 'anaerobic',
    label: '厌氧',
  });
});

test('resolveGuidedProcessStyleSelection maps experimental choice to yeast-like options first', () => {
  const selection = resolveGuidedProcessStyleSelection(
    'experimental' satisfies GuidedProcessStyleChoiceId,
    PROCESS_STYLE_OPTIONS
  );

  assert.deepEqual(selection, {
    id: 'yeast',
    label: '酵母',
  });
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

test('buildGuidedDiscoverStep starts from process base question', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcessBase: 'all',
      selectedProcessStyle: 'all',
      selectedContinent: 'all',
      selectedCountry: 'all',
      selectedVariety: 'all',
    }),
    {
      step: 'process_base',
      title: '先告诉我你想从哪种基础处理法开始',
      description: '我会先帮你定一个基础处理法方向，再继续收窄到处理风格和产地区域。',
    }
  );
});

test('buildGuidedDiscoverStep moves to process style question after base is selected', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcessBase: 'washed',
      selectedProcessStyle: 'all',
      selectedContinent: 'all',
      selectedCountry: 'all',
      selectedVariety: 'all',
    }),
    {
      step: 'process_style',
      title: '第二步，再选一个处理风格',
      description: '基础处理法已经定好了，现在继续缩小到更具体的处理风格。',
    }
  );
});

test('buildGuidedDiscoverStep moves to continent question after style is selected', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcessBase: 'washed',
      selectedProcessStyle: 'traditional',
      selectedContinent: 'all',
      selectedCountry: 'all',
      selectedVariety: 'all',
    }),
    {
      step: 'continent',
      title: '下一步，选一个更接近你期待风味的区域',
      description: '处理风格已经定好了，现在再用大洲和国家把结果继续缩小。',
    }
  );
});

test('buildGuidedDiscoverStep moves to country question once continent is selected', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcessBase: 'washed',
      selectedProcessStyle: 'traditional',
      selectedContinent: 'africa',
      selectedCountry: 'all',
      selectedVariety: 'all',
    }),
    {
      step: 'country',
      title: '最后一步，再缩小到具体国家',
      description: '大洲已经定好了，再选一个国家，就能直接看到更聚焦的豆单。',
    }
  );
});

test('buildGuidedDiscoverStep moves to optional variety question once country is selected', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcessBase: 'washed',
      selectedProcessStyle: 'traditional',
      selectedContinent: 'africa',
      selectedCountry: '埃塞俄比亚',
      selectedVariety: 'all',
    }),
    {
      step: 'variety',
      title: '如果你已经有目标豆种，可以继续细分',
      description: '这一步是可选的，不选也可以直接看结果。',
    }
  );
});

test('buildGuidedDiscoverStep finishes once variety is selected', () => {
  assert.deepEqual(
    buildGuidedDiscoverStep({
      selectedProcessBase: 'washed',
      selectedProcessStyle: 'traditional',
      selectedContinent: 'africa',
      selectedCountry: '埃塞俄比亚',
      selectedVariety: '74110',
    }),
    {
      step: 'done',
      title: '已经帮你缩小到一条可直接浏览的路径',
      description: '你可以直接往下看推荐和豆单，也可以重新回答一次，换一条路线。',
    }
  );
});

test('shouldExpandGuidedDiscoverCard keeps guided entry collapsed for now', () => {
  assert.equal(shouldExpandGuidedDiscoverCard('guided'), false);
});

test('shouldExpandGuidedDiscoverCard keeps direct entry collapsed by default', () => {
  assert.equal(shouldExpandGuidedDiscoverCard('direct'), false);
});

test('shouldExpandGuidedDiscoverCard keeps default entry collapsed by default', () => {
  assert.equal(shouldExpandGuidedDiscoverCard('default'), false);
});

test('shouldShowGuidedDiscoverCard hides guided entry card for now', () => {
  assert.equal(shouldShowGuidedDiscoverCard('guided'), false);
});

test('shouldShowGuidedDiscoverCard hides direct entry card for now', () => {
  assert.equal(shouldShowGuidedDiscoverCard('direct'), false);
});

test('shouldShowGuidedDiscoverCard hides default entry card for now', () => {
  assert.equal(shouldShowGuidedDiscoverCard('default'), false);
});
