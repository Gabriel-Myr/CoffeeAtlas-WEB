import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import {
  buildHomeNewArrivalBeanParams,
  getHomeNewArrivalEmptyStateMessage,
  hasActiveHomeNewArrivalFilters,
} from '../src/pages/index/new-arrivals-page.ts';

const projectRoot = path.resolve(import.meta.dirname, '..');

test('buildHomeNewArrivalBeanParams keeps the home page locked to new arrivals', () => {
  assert.deepEqual(
    buildHomeNewArrivalBeanParams({
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

test('hasActiveHomeNewArrivalFilters reports active state for search or filter input', () => {
  assert.equal(
    hasActiveHomeNewArrivalFilters({
      searchQuery: '',
      selectedRoasterId: '',
      selectedProcess: '',
      selectedOriginCountry: '',
    }),
    false
  );

  assert.equal(
    hasActiveHomeNewArrivalFilters({
      searchQuery: '果汁感',
      selectedRoasterId: '',
      selectedProcess: '',
      selectedOriginCountry: '',
    }),
    true
  );

  assert.equal(
    hasActiveHomeNewArrivalFilters({
      searchQuery: '',
      selectedRoasterId: '',
      selectedProcess: '日晒',
      selectedOriginCountry: '',
    }),
    true
  );
});

test('getHomeNewArrivalEmptyStateMessage distinguishes default and filtered empty states', () => {
  assert.equal(
    getHomeNewArrivalEmptyStateMessage(false),
    '当前还没有可展示的新品'
  );

  assert.equal(
    getHomeNewArrivalEmptyStateMessage(true),
    '没有匹配到符合条件的新品，试试换个搜索词或筛选条件'
  );
});

test('home page title is set to 新品', () => {
  const homePageConfigSource = readFileSync(
    path.join(projectRoot, 'src/pages/index/index.config.ts'),
    'utf8'
  );

  assert.match(homePageConfigSource, /navigationBarTitleText:\s*'新品'/);
});
