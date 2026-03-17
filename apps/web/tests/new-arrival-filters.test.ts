import assert from 'node:assert/strict';
import test from 'node:test';

import type { CatalogBeanCard } from '@coffee-atlas/shared-types';

import {
  buildNewArrivalFiltersPayload,
  type NewArrivalFilterSource,
} from '../lib/server/new-arrival-filters.ts';
import { matchesBeanListFilters } from '../lib/server/bean-list-filters.ts';

function makeNewArrivalBean(overrides: Partial<CatalogBeanCard> = {}): CatalogBeanCard {
  return {
    id: overrides.id ?? 'bean-1',
    name: overrides.name ?? 'Bean',
    roasterId: overrides.roasterId ?? 'roaster-1',
    roasterName: overrides.roasterName ?? 'Roaster',
    city: overrides.city ?? 'Shanghai',
    originCountry: overrides.originCountry ?? '埃塞俄比亚',
    process: overrides.process ?? '水洗',
    roastLevel: overrides.roastLevel ?? '浅烘',
    price: overrides.price ?? 88,
    currency: overrides.currency ?? 'CNY',
    salesCount: overrides.salesCount ?? 0,
    imageUrl: overrides.imageUrl ?? null,
    isInStock: overrides.isInStock ?? true,
    originRegion: overrides.originRegion,
    farm: overrides.farm,
    variety: overrides.variety,
    discountedPrice: overrides.discountedPrice,
    tastingNotes: overrides.tastingNotes,
    isNewArrival: overrides.isNewArrival ?? true,
  };
}

test('buildNewArrivalFiltersPayload prefers personal favorites when all groups are available', () => {
  const payload = buildNewArrivalFiltersPayload({
    favoriteBeans: [
      { originCountry: '埃塞俄比亚', process: '水洗' },
      { originCountry: '哥伦比亚', process: '水洗' },
      { originCountry: '埃塞俄比亚', process: '日晒' },
    ],
    favoriteRoasters: [
      { id: 'roaster-1', name: 'Roaster One' },
      { id: 'roaster-2', name: 'Roaster Two' },
    ],
    newArrivalBeans: [
      makeNewArrivalBean({ id: 'bean-1', roasterId: 'roaster-1', roasterName: 'Roaster One', originCountry: '埃塞俄比亚', process: '水洗' }),
      makeNewArrivalBean({ id: 'bean-2', roasterId: 'roaster-2', roasterName: 'Roaster Two', originCountry: '巴拿马', process: '日晒' }),
      makeNewArrivalBean({ id: 'bean-3', roasterId: 'roaster-3', roasterName: 'Roaster Three', originCountry: '哥伦比亚', process: '水洗' }),
    ],
  });

  assert.equal(payload.mode, 'personalized');
  assert.deepEqual(payload.roasterOptions, [
    { id: 'roaster-1', label: 'Roaster One', count: 1 },
    { id: 'roaster-2', label: 'Roaster Two', count: 1 },
  ]);
  assert.deepEqual(payload.processOptions, [
    { id: '水洗', label: '水洗', count: 2 },
    { id: '日晒', label: '日晒', count: 1 },
  ]);
  assert.deepEqual(payload.originOptions, [
    { id: '埃塞俄比亚', label: '埃塞俄比亚', count: 1 },
    { id: '哥伦比亚', label: '哥伦比亚', count: 1 },
  ]);
});

test('buildNewArrivalFiltersPayload falls back by group when personal favorites are missing', () => {
  const payload = buildNewArrivalFiltersPayload({
    favoriteBeans: [],
    favoriteRoasters: [{ id: 'roaster-2', name: 'Roaster Two' }],
    newArrivalBeans: [
      makeNewArrivalBean({ id: 'bean-1', roasterId: 'roaster-1', roasterName: 'Roaster One', originCountry: '埃塞俄比亚', process: '水洗' }),
      makeNewArrivalBean({ id: 'bean-2', roasterId: 'roaster-2', roasterName: 'Roaster Two', originCountry: '哥伦比亚', process: '日晒' }),
      makeNewArrivalBean({ id: 'bean-3', roasterId: 'roaster-1', roasterName: 'Roaster One', originCountry: '哥伦比亚', process: '水洗' }),
      makeNewArrivalBean({ id: 'bean-4', roasterId: 'roaster-3', roasterName: 'Roaster Three', originCountry: '巴拿马', process: '厌氧' }),
    ],
  });

  assert.equal(payload.mode, 'mixed');
  assert.deepEqual(payload.sources, {
    roaster: 'personalized',
    process: 'fallback',
    origin: 'fallback',
  } satisfies Record<'roaster' | 'process' | 'origin', NewArrivalFilterSource>);
  assert.deepEqual(payload.roasterOptions, [{ id: 'roaster-2', label: 'Roaster Two', count: 1 }]);
  assert.deepEqual(payload.processOptions, [
    { id: '水洗', label: '水洗', count: 2 },
    { id: '日晒', label: '日晒', count: 1 },
    { id: '厌氧', label: '厌氧', count: 1 },
  ]);
  assert.deepEqual(payload.originOptions, [
    { id: '哥伦比亚', label: '哥伦比亚', count: 2 },
    { id: '埃塞俄比亚', label: '埃塞俄比亚', count: 1 },
    { id: '巴拿马', label: '巴拿马', count: 1 },
  ]);
});

test('matchesBeanListFilters supports roasterId filtering', () => {
  const matched = matchesBeanListFilters(makeNewArrivalBean({
    id: 'bean-2',
    roasterId: 'Rightpaw Coffee',
    roasterName: 'Rightpaw Coffee',
  }), {
    roasterId: 'Rightpaw Coffee',
  });

  const missed = matchesBeanListFilters(makeNewArrivalBean({
    id: 'bean-3',
    roasterId: 'Captain George',
    roasterName: 'Captain George',
  }), {
    roasterId: 'Rightpaw Coffee',
  });

  assert.equal(matched, true);
  assert.equal(missed, false);
});
