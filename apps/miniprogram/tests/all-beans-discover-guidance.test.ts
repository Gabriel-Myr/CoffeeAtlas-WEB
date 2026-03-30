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

test('selected process base does not show a next-step guidance card', () => {
  assert.equal(
    buildDiscoverGuidance({
      landingMode: 'guided',
      selectedProcessBase: 'washed',
      selectedProcessStyle: 'all',
      selectedContinent: 'all',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    null
  );
});

test('selected process style does not show a next-step guidance card', () => {
  assert.equal(
    buildDiscoverGuidance({
      landingMode: 'guided',
      selectedProcessBase: 'washed',
      selectedProcessStyle: 'anaerobic',
      selectedContinent: 'all',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    null
  );
});

test('selected continent does not show a next-step guidance card', () => {
  assert.equal(
    buildDiscoverGuidance({
      landingMode: 'direct',
      selectedProcessBase: 'all',
      selectedProcessStyle: 'all',
      selectedContinent: 'africa',
      selectedCountry: 'all',
      searchQuery: '',
    }),
    null
  );
});

test('selected country also keeps the guidance card hidden', () => {
  assert.equal(
    buildDiscoverGuidance({
      landingMode: 'guided',
      selectedProcessBase: 'all',
      selectedProcessStyle: 'all',
      selectedContinent: 'africa',
      selectedCountry: '埃塞俄比亚',
      searchQuery: '',
    }),
    null
  );
});
