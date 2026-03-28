import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatProcessLabel,
  getAvailableProcessStyleDefinitions,
  normalizeProcess,
} from '@coffee-atlas/shared-types';

test('normalizeProcess maps mixed raw labels into stable base and style ids', () => {
  assert.deepEqual(normalizeProcess('水洗'), {
    raw: '水洗',
    base: 'washed',
    style: 'traditional',
    baseLabel: '水洗',
    styleLabel: '传统',
    label: '水洗',
  });

  assert.deepEqual(normalizeProcess('anaerobic natural'), {
    raw: 'anaerobic natural',
    base: 'natural',
    style: 'anaerobic',
    baseLabel: '日晒',
    styleLabel: '厌氧',
    label: '厌氧日晒',
  });

  assert.deepEqual(normalizeProcess('热冲击蜜处理'), {
    raw: '热冲击蜜处理',
    base: 'honey',
    style: 'thermal_shock',
    baseLabel: '蜜处理',
    styleLabel: '热冲击',
    label: '热冲击蜜处理',
  });

  assert.deepEqual(normalizeProcess('experimental infused lot'), {
    raw: 'experimental infused lot',
    base: 'other',
    style: 'other',
    baseLabel: '其他',
    styleLabel: '其他',
    label: '其他',
  });
});

test('formatProcessLabel hides traditional for explicit base labels and keeps other-style readable', () => {
  assert.equal(formatProcessLabel('washed', 'traditional'), '水洗');
  assert.equal(formatProcessLabel('natural', 'anaerobic'), '厌氧日晒');
  assert.equal(formatProcessLabel('other', 'anaerobic'), '厌氧处理');
  assert.equal(formatProcessLabel('other', 'other'), '其他');
});

test('getAvailableProcessStyleDefinitions keeps only other style for other base', () => {
  assert.deepEqual(
    getAvailableProcessStyleDefinitions('other').map((item) => item.id),
    ['other']
  );
});
