import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildNewArrivalFiltersPayload,
  type NewArrivalBeanSeed,
  type FavoriteBeanPreference,
  type FavoriteRoasterPreference,
} from '../lib/server/new-arrival-filters-helpers.ts';

const fallbackBeans: NewArrivalBeanSeed[] = [
  { roasterId: 'roaster-1', roasterName: 'Metal Hands', process: '水洗', originCountry: '埃塞俄比亚' },
  { roasterId: 'roaster-1', roasterName: 'Metal Hands', process: '水洗', originCountry: '埃塞俄比亚' },
  { roasterId: 'roaster-2', roasterName: 'Pause', process: '日晒', originCountry: '巴拿马' },
  { roasterId: 'roaster-3', roasterName: 'Manner', process: '厌氧', originCountry: '哥伦比亚' },
];

test('buildNewArrivalFiltersPayload uses favorites first and caps each group at 3', () => {
  const favoriteBeans: FavoriteBeanPreference[] = [
    { process: '水洗', originCountry: '埃塞俄比亚' },
    { process: '水洗', originCountry: '巴拿马' },
    { process: '日晒', originCountry: '埃塞俄比亚' },
    { process: '蜜处理', originCountry: '哥斯达黎加' },
    { process: '蜜处理', originCountry: '哥斯达黎加' },
  ];
  const favoriteRoasters: FavoriteRoasterPreference[] = [
    { id: 'roaster-a', name: 'AOKKA' },
    { id: 'roaster-b', name: 'Moonwake' },
    { id: 'roaster-c', name: 'O.P.S' },
    { id: 'roaster-d', name: 'Lian' },
  ];

  const payload = buildNewArrivalFiltersPayload({
    favoriteBeans,
    favoriteRoasters,
    fallbackBeans,
  });

  assert.equal(payload.mode, 'personalized');
  assert.deepEqual(payload.roasterOptions, [
    { id: 'roaster-a', label: 'AOKKA', count: 1 },
    { id: 'roaster-b', label: 'Moonwake', count: 1 },
    { id: 'roaster-c', label: 'O.P.S', count: 1 },
  ]);
  assert.deepEqual(payload.processOptions, [
    { id: '蜜处理', label: '蜜处理', count: 2 },
    { id: '水洗', label: '水洗', count: 2 },
    { id: '日晒', label: '日晒', count: 1 },
  ]);
  assert.deepEqual(payload.originOptions, [
    { id: '埃塞俄比亚', label: '埃塞俄比亚', count: 2 },
    { id: '哥斯达黎加', label: '哥斯达黎加', count: 2 },
    { id: '巴拿马', label: '巴拿马', count: 1 },
  ]);
});

test('buildNewArrivalFiltersPayload falls back only for missing groups', () => {
  const payload = buildNewArrivalFiltersPayload({
    favoriteBeans: [],
    favoriteRoasters: [{ id: 'roaster-a', name: 'AOKKA' }],
    fallbackBeans,
  });

  assert.equal(payload.mode, 'mixed');
  assert.deepEqual(payload.roasterOptions, [{ id: 'roaster-a', label: 'AOKKA', count: 1 }]);
  assert.deepEqual(payload.processOptions, [
    { id: '水洗', label: '水洗', count: 2 },
    { id: '日晒', label: '日晒', count: 1 },
    { id: '厌氧', label: '厌氧', count: 1 },
  ]);
  assert.deepEqual(payload.originOptions, [
    { id: '埃塞俄比亚', label: '埃塞俄比亚', count: 2 },
    { id: '巴拿马', label: '巴拿马', count: 1 },
    { id: '哥伦比亚', label: '哥伦比亚', count: 1 },
  ]);
});
