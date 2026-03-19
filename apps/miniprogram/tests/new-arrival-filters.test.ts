import assert from 'node:assert/strict';
import test from 'node:test';

import type { BeanSnapshot, RoasterSnapshot } from '../src/utils/storage.ts';
import type { CoffeeBean } from '../src/types/index.ts';
import {
  buildLocalNewArrivalFiltersFallback,
  buildNewArrivalBeanRequestParams,
  buildNewArrivalFiltersRequest,
  resolveNewArrivalFiltersPayload,
} from '../src/pages/all-beans/new-arrival-filters.ts';

const beanFavorites: BeanSnapshot[] = [
  {
    id: 'bean-1',
    name: 'Bean 1',
    roasterName: 'Roaster 1',
    imageUrl: null,
    originCountry: '哥伦比亚',
    process: '水洗',
    price: 99,
  },
  {
    id: 'bean-2',
    name: 'Bean 2',
    roasterName: 'Roaster 2',
    imageUrl: null,
    originCountry: '埃塞俄比亚',
    process: '日晒',
    price: 129,
  },
];

const roasterFavorites: RoasterSnapshot[] = [
  { id: 'roaster-1', name: 'Metal Hands', city: 'Shanghai' },
  { id: 'roaster-2', name: 'AOKKA', city: 'Shenzhen' },
];

const newArrivalBeans: CoffeeBean[] = [
  {
    id: 'bean-a',
    name: 'Bean A',
    roasterId: 'roaster-1',
    roasterName: 'Metal Hands',
    city: 'Shanghai',
    originCountry: '埃塞俄比亚',
    process: '水洗',
    roastLevel: '浅烘',
    price: 128,
    currency: 'CNY',
    salesCount: 1,
    imageUrl: null,
    isNewArrival: true,
    isInStock: true,
  },
  {
    id: 'bean-b',
    name: 'Bean B',
    roasterId: 'roaster-1',
    roasterName: 'Metal Hands',
    city: 'Shanghai',
    originCountry: '埃塞俄比亚',
    process: '水洗',
    roastLevel: '浅烘',
    price: 138,
    currency: 'CNY',
    salesCount: 2,
    imageUrl: null,
    isNewArrival: true,
    isInStock: true,
  },
  {
    id: 'bean-c',
    name: 'Bean C',
    roasterId: 'roaster-2',
    roasterName: 'AOKKA',
    city: 'Shenzhen',
    originCountry: '巴拿马',
    process: '日晒',
    roastLevel: '浅烘',
    price: 168,
    currency: 'CNY',
    salesCount: 3,
    imageUrl: null,
    isNewArrival: true,
    isInStock: true,
  },
];

test('buildNewArrivalFiltersRequest keeps only lightweight local favorite snapshots', () => {
  assert.deepEqual(buildNewArrivalFiltersRequest(beanFavorites, roasterFavorites), {
    beanFavorites: [
      { process: '水洗', originCountry: '哥伦比亚' },
      { process: '日晒', originCountry: '埃塞俄比亚' },
    ],
    roasterFavorites: [
      { id: 'roaster-1', name: 'Metal Hands' },
      { id: 'roaster-2', name: 'AOKKA' },
    ],
  });
});

test('buildNewArrivalBeanRequestParams adds new-arrival filters without roast level', () => {
  assert.deepEqual(
    buildNewArrivalBeanRequestParams({
      searchQuery: '花香',
      selectedRoasterId: 'roaster-1',
      selectedProcess: '水洗',
      selectedOriginCountry: '埃塞俄比亚',
      page: 2,
      pageSize: 20,
    }),
    {
      page: 2,
      pageSize: 20,
      q: '花香',
      sort: 'updated_desc',
      isNewArrival: true,
      roasterId: 'roaster-1',
      process: '水洗',
      originCountry: '埃塞俄比亚',
    }
  );
});

test('buildLocalNewArrivalFiltersFallback derives hot options from current new-arrival beans', () => {
  assert.deepEqual(buildLocalNewArrivalFiltersFallback(newArrivalBeans), {
    mode: 'fallback',
    roasterOptions: [
      { id: 'roaster-1', label: 'Metal Hands', count: 2 },
      { id: 'roaster-2', label: 'AOKKA', count: 1 },
    ],
    processOptions: [
      { id: '水洗', label: '水洗', count: 2 },
      { id: '日晒', label: '日晒', count: 1 },
    ],
    originOptions: [
      { id: '埃塞俄比亚', label: '埃塞俄比亚', count: 2 },
      { id: '巴拿马', label: '巴拿马', count: 1 },
    ],
  });
});

test('resolveNewArrivalFiltersPayload falls back to local beans when remote payload is empty', () => {
  assert.deepEqual(
    resolveNewArrivalFiltersPayload(
      {
        mode: 'personalized',
        roasterOptions: [],
        processOptions: [],
        originOptions: [],
      },
      newArrivalBeans
    ),
    buildLocalNewArrivalFiltersFallback(newArrivalBeans)
  );
});

test('resolveNewArrivalFiltersPayload fills missing groups from local beans', () => {
  assert.deepEqual(
    resolveNewArrivalFiltersPayload(
      {
        mode: 'mixed',
        roasterOptions: [{ id: 'roaster-x', label: 'Remote Roaster', count: 5 }],
        processOptions: [],
        originOptions: [],
      },
      newArrivalBeans
    ),
    {
      mode: 'mixed',
      roasterOptions: [{ id: 'roaster-x', label: 'Remote Roaster', count: 5 }],
      processOptions: [
        { id: '水洗', label: '水洗', count: 2 },
        { id: '日晒', label: '日晒', count: 1 },
      ],
      originOptions: [
        { id: '埃塞俄比亚', label: '埃塞俄比亚', count: 2 },
        { id: '巴拿马', label: '巴拿马', count: 1 },
      ],
    }
  );
});
