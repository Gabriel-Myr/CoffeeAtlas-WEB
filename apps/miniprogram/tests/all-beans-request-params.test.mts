import assert from 'node:assert/strict';
import test from 'node:test';

import { ALL_DISCOVER_VALUE } from '../src/pages/all-beans/route-state-core.ts';
import {
  buildBeansPageParams,
  buildNewArrivalFiltersRequestBody,
} from '../src/pages/all-beans/request-params.ts';

test('sales tab uses list filter bar params', () => {
  const params = buildBeansPageParams({
    tab: 'sales',
    page: 2,
    searchQuery: '花香',
    discoverProcess: ALL_DISCOVER_VALUE,
    discoverContinent: ALL_DISCOVER_VALUE,
    discoverCountry: ALL_DISCOVER_VALUE,
    newRoasterId: '',
    newProcess: '',
    newOriginCountry: '',
    listProcess: '日晒',
    listRoastLevel: '中烘',
  });

  assert.deepEqual(params, {
    page: 2,
    pageSize: 20,
    q: '花香',
    sort: 'sales_desc',
    process: '日晒',
    roastLevel: '中烘',
  });
});

test('discover tab keeps atlas path params and ignores list filter bar params', () => {
  const params = buildBeansPageParams({
    tab: 'discover',
    page: 1,
    searchQuery: '',
    discoverProcess: '水洗',
    discoverContinent: 'africa',
    discoverCountry: '埃塞俄比亚',
    newRoasterId: '',
    newProcess: '',
    newOriginCountry: '',
    listProcess: '日晒',
    listRoastLevel: '中烘',
  });

  assert.deepEqual(params, {
    page: 1,
    pageSize: 20,
    sort: 'updated_desc',
    process: '水洗',
    continent: 'africa',
    country: '埃塞俄比亚',
  });
});

test('new tab keeps new arrival mode and combines it with personalized filters', () => {
  const params = buildBeansPageParams({
    tab: 'new',
    page: 3,
    searchQuery: '',
    discoverProcess: ALL_DISCOVER_VALUE,
    discoverContinent: ALL_DISCOVER_VALUE,
    discoverCountry: ALL_DISCOVER_VALUE,
    newRoasterId: 'roaster-1',
    newProcess: '厌氧',
    newOriginCountry: '哥伦比亚',
    listProcess: '日晒',
    listRoastLevel: '浅',
  });

  assert.deepEqual(params, {
    page: 3,
    pageSize: 20,
    sort: 'updated_desc',
    isNewArrival: true,
    roasterId: 'roaster-1',
    process: '厌氧',
    originCountry: '哥伦比亚',
  });
});

test('buildNewArrivalFiltersRequestBody keeps only lightweight local favorite fields', () => {
  const body = buildNewArrivalFiltersRequestBody({
    beanFavorites: [
      {
        id: 'bean-1',
        name: 'A',
        roasterName: 'Roaster A',
        imageUrl: null,
        originCountry: '埃塞俄比亚',
        process: '水洗',
        price: 88,
      },
      {
        id: 'bean-2',
        name: 'B',
        roasterName: 'Roaster B',
        imageUrl: null,
        originCountry: '',
        process: '',
        price: 99,
      },
    ],
    roasterFavorites: [
      {
        id: 'roaster-1',
        name: 'Roaster A',
        city: '上海',
      },
    ],
  });

  assert.deepEqual(body, {
    localBeans: [
      {
        originCountry: '埃塞俄比亚',
        process: '水洗',
      },
    ],
    localRoasters: [
      {
        id: 'roaster-1',
        name: 'Roaster A',
      },
    ],
  });
});
