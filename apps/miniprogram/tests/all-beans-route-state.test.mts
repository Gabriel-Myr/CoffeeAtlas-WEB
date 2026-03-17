import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAllBeansRouteUrl,
  getInitialAllBeansRouteStateFromResolver,
} from '../src/pages/all-beans/route-state-core.ts';

test('atlas params force discover tab and decode route values', () => {
  const state = getInitialAllBeansRouteStateFromResolver({
    tab: 'sales',
    continent: 'asia',
    country: encodeURIComponent('云南'),
    q: encodeURIComponent('花香'),
  }, () => 'asia');

  assert.equal(state.activeTab, 'discover');
  assert.equal(state.selectedContinent, 'asia');
  assert.equal(state.selectedCountry, '云南');
  assert.equal(state.selectedProcess, 'all');
  assert.equal(state.searchQuery, '花香');
});

test('country route param wins over continent and backfills the matched continent', () => {
  const state = getInitialAllBeansRouteStateFromResolver({
    continent: 'africa',
    country: encodeURIComponent('哥伦比亚'),
  }, () => 'americas');

  assert.equal(state.activeTab, 'discover');
  assert.equal(state.selectedContinent, 'americas');
  assert.equal(state.selectedCountry, '哥伦比亚');
});

test('buildAllBeansRouteUrl encodes atlas params for deep links', () => {
  const url = buildAllBeansRouteUrl({
    tab: 'discover',
    continent: 'asia',
    country: '云南',
  });

  assert.equal(url, '/pages/all-beans/index?tab=discover&continent=asia&country=%E4%BA%91%E5%8D%97');
});
