import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDiscoverGuidance } from '../src/pages/all-beans/discover-guidance.ts';

test('guided landing does not show the extra first-step guidance card', () => {
  assert.equal(
    buildDiscoverGuidance({
      landingMode: 'guided',
      selectedProcessBase: 'all',
      selectedProcessStyle: 'all',
      selectedContinent: 'all',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    null
  );
});

test('direct landing also skips the extra initial guidance card', () => {
  assert.equal(
    buildDiscoverGuidance({
      landingMode: 'direct',
      selectedProcessBase: 'all',
      selectedProcessStyle: 'all',
      selectedContinent: 'all',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    null
  );
});

test('selected process base highlights style as the next step', () => {
  assert.deepEqual(
    buildDiscoverGuidance({
      landingMode: 'guided',
      selectedProcessBase: 'washed',
      selectedProcessStyle: 'all',
      selectedContinent: 'all',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    {
      label: '下一步',
      title: '再选一个处理风格，让路径更清楚',
      description: '基础处理法已经确定了，接下来再选传统、厌氧或其他特殊风格，结果会更贴近你的口味。',
    }
  );
});

test('selected process style highlights continent as the next step', () => {
  assert.deepEqual(
    buildDiscoverGuidance({
      landingMode: 'guided',
      selectedProcessBase: 'washed',
      selectedProcessStyle: 'anaerobic',
      selectedContinent: 'all',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    {
      label: '下一步',
      title: '选一个大洲，让结果更聚焦',
      description: '你已经定好了基础处理法和风格，接下来选风土区域，国家列表也会跟着缩小。',
    }
  );
});

test('selected continent explains the optional country step', () => {
  assert.deepEqual(
    buildDiscoverGuidance({
      landingMode: 'direct',
      selectedProcessBase: 'all',
      selectedProcessStyle: 'all',
      selectedContinent: 'africa',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    {
      label: '下一步',
      title: '继续选国家，或先看当前结果',
      description: '现在已经缩到大洲级别了，想更精确就继续选国家；想先浏览也可以直接往下看。',
    }
  );
});

test('selected country tells users to continue browsing results', () => {
  assert.deepEqual(
    buildDiscoverGuidance({
      landingMode: 'guided',
      selectedProcessBase: 'all',
      selectedProcessStyle: 'all',
      selectedContinent: 'africa',
      selectedCountry: '埃塞俄比亚',
      searchQuery: '',
    }),
    {
      label: '当前状态',
      title: '结果已经很聚焦，可以直接往下看豆单',
      description: '如果结果还是太多，再回头调整处理法；如果刚刚好，就继续看推荐和完整列表。',
    }
  );
});
