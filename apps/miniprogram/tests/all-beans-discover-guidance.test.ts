import assert from 'node:assert/strict';
import test from 'node:test';

import { buildDiscoverGuidance } from '../src/pages/all-beans/discover-guidance.ts';

test('guided landing starts with a softer first step', () => {
  assert.deepEqual(
    buildDiscoverGuidance({
      landingMode: 'guided',
      selectedProcess: 'all',
      selectedContinent: 'all',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    {
      label: '推荐下一步',
      title: '先选一个处理法方向',
      description: '不用一次决定太多，先从杯型方向开始，后面再慢慢缩小到大洲和国家。',
    }
  );
});

test('direct landing tells users they can filter immediately', () => {
  assert.deepEqual(
    buildDiscoverGuidance({
      landingMode: 'direct',
      selectedProcess: 'all',
      selectedContinent: 'all',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    {
      label: '当前可操作',
      title: '直接选处理法，或先搜你熟悉的关键词',
      description: '如果你已经知道自己想看什么，可以马上叠加大洲和国家继续收窄结果。',
    }
  );
});

test('selected process highlights continent as the next step', () => {
  assert.deepEqual(
    buildDiscoverGuidance({
      landingMode: 'guided',
      selectedProcess: '水洗',
      selectedContinent: 'all',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    {
      label: '下一步',
      title: '选一个大洲，让结果更聚焦',
      description: '你已经选了处理法，接下来选风土区域，国家列表也会跟着缩小。',
    }
  );
});

test('selected continent explains the optional country step', () => {
  assert.deepEqual(
    buildDiscoverGuidance({
      landingMode: 'direct',
      selectedProcess: 'all',
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
      selectedProcess: 'all',
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
