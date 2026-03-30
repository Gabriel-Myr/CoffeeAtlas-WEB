import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildBeanDiscoverPayload,
  buildNewArrivalFiltersPayload,
  getNewArrivalFiltersWithSupabase,
  listBeansWithSupabase,
  mapCatalogBeanRow,
  mapRoasterDetail,
  mapRoasterSummary,
} from '../src/services/catalog-supabase.ts';

test('mapCatalogBeanRow maps supabase row fields into miniprogram bean dto', () => {
  const bean = mapCatalogBeanRow(
    {
      roaster_bean_id: 'bean-1',
      roaster_id: 'roaster-1',
      roaster_name: 'Roaster One',
      city: 'Shanghai',
      display_name: 'Ethiopia Guji',
      origin_country: 'Ethiopia',
      origin_region: 'Guji',
      farm: 'Halo',
      variety: '74110',
      process_method: 'Washed',
      roast_level: 'Light',
      price_amount: '88',
      price_currency: 'CNY',
      sales_count: 120,
      image_url: 'https://img.example/bean.jpg',
      is_in_stock: true,
    },
    new Set(['bean-1'])
  );

  assert.deepEqual(bean, {
    id: 'bean-1',
    name: 'Ethiopia Guji',
    roasterId: 'roaster-1',
    roasterName: 'Roaster One',
    city: 'Shanghai',
    originCountry: 'Ethiopia',
    originRegion: 'Guji',
    farm: 'Halo',
    variety: '74110',
    process: '水洗',
    processBase: 'washed',
    processStyle: 'traditional',
    processRaw: 'Washed',
    roastLevel: 'Light',
    price: 88,
    discountedPrice: 88,
    currency: 'CNY',
    salesCount: 120,
    tastingNotes: [],
    imageUrl: 'https://img.example/bean.jpg',
    isInStock: true,
    isNewArrival: true,
  });
});

test('buildBeanDiscoverPayload builds options, summary and editor picks from bean list', () => {
  const payload = buildBeanDiscoverPayload({
    beans: [
      {
        id: 'bean-1',
        name: 'Kenya AA',
        roasterId: 'r1',
        roasterName: 'North',
        city: 'Shanghai',
        originCountry: 'Kenya',
        originRegion: 'Nyeri',
        farm: '',
        variety: 'SL28',
        process: 'Washed',
        roastLevel: 'Light',
        price: 90,
        discountedPrice: 90,
        currency: 'CNY',
        salesCount: 20,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: true,
      },
      {
        id: 'bean-2',
        name: 'Brazil Sunset',
        roasterId: 'r2',
        roasterName: 'South',
        city: 'Beijing',
        originCountry: 'Brazil',
        originRegion: 'Sul de Minas',
        farm: '',
        variety: 'Bourbon',
        process: 'Natural',
        roastLevel: 'Medium',
        price: 78,
        discountedPrice: 78,
        currency: 'CNY',
        salesCount: 15,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
    ],
    filters: {
      processBase: 'washed',
      processStyle: 'traditional',
      continent: 'africa',
      country: 'Kenya',
      variety: 'SL28',
    },
  });

  assert.equal(payload.resultSummary.total, 1);
  assert.equal(payload.editorial.mode, 'fallback');
  assert.equal(payload.editorial.title.includes('SL28'), true);
  assert.equal(payload.processBaseOptions.some((option) => option.id === 'washed'), true);
  assert.equal(payload.processStyleOptions.some((option) => option.id === 'traditional'), true);
  assert.equal(payload.continentOptions.some((option) => option.id === 'africa'), true);
  assert.equal(payload.countryOptions.some((option) => option.label === '肯尼亚'), true);
  assert.equal(payload.varietyOptions.some((option) => option.label === 'SL28'), true);
  assert.equal(payload.editorPicks[0]?.bean.id, 'bean-1');
  assert.equal(payload.resultSummary.variety, 'SL28');
});

test('buildBeanDiscoverPayload keeps same-level options switchable after selection', () => {
  const payload = buildBeanDiscoverPayload({
    beans: [
      {
        id: 'bean-1',
        name: 'Kenya Washed Classic',
        roasterId: 'r1',
        roasterName: 'North',
        city: 'Shanghai',
        originCountry: 'Kenya',
        originRegion: 'Nyeri',
        farm: '',
        variety: 'SL28',
        process: 'Washed',
        processBase: 'washed',
        processStyle: 'traditional',
        roastLevel: 'Light',
        price: 90,
        discountedPrice: 90,
        currency: 'CNY',
        salesCount: 20,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: true,
      },
      {
        id: 'bean-2',
        name: 'Ethiopia Natural Classic',
        roasterId: 'r2',
        roasterName: 'South',
        city: 'Beijing',
        originCountry: 'Ethiopia',
        originRegion: 'Guji',
        farm: '',
        variety: '74110',
        process: 'Natural',
        processBase: 'natural',
        processStyle: 'traditional',
        roastLevel: 'Light',
        price: 88,
        discountedPrice: 88,
        currency: 'CNY',
        salesCount: 18,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
      {
        id: 'bean-3',
        name: 'Ethiopia Washed Anaerobic',
        roasterId: 'r3',
        roasterName: 'West',
        city: 'Guangzhou',
        originCountry: 'Ethiopia',
        originRegion: 'Sidama',
        farm: '',
        variety: '74112',
        process: 'Anaerobic Washed',
        processBase: 'washed',
        processStyle: 'anaerobic',
        roastLevel: 'Light',
        price: 95,
        discountedPrice: 95,
        currency: 'CNY',
        salesCount: 14,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
      {
        id: 'bean-4',
        name: 'Brazil Washed Classic',
        roasterId: 'r4',
        roasterName: 'East',
        city: 'Shenzhen',
        originCountry: 'Brazil',
        originRegion: 'Sul de Minas',
        farm: '',
        variety: 'Bourbon',
        process: 'Washed',
        processBase: 'washed',
        processStyle: 'traditional',
        roastLevel: 'Medium',
        price: 82,
        discountedPrice: 82,
        currency: 'CNY',
        salesCount: 10,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
    ],
    filters: {
      processBase: 'washed',
      processStyle: 'traditional',
      continent: 'africa',
    },
  });

  assert.equal(payload.resultSummary.total, 1);
  assert.deepEqual(
    payload.processBaseOptions.map((option) => option.id),
    ['washed', 'natural']
  );
  assert.deepEqual(
    payload.processStyleOptions.map((option) => option.id),
    ['traditional', 'anaerobic']
  );
  assert.deepEqual(
    payload.continentOptions.map((option) => option.id),
    ['americas', 'africa']
  );
  assert.deepEqual(
    payload.varietyOptions.map((option) => option.label),
    ['SL28']
  );
});

test('buildBeanDiscoverPayload splits multi-value varieties into individual selectable options', () => {
  const payload = buildBeanDiscoverPayload({
    beans: [
      {
        id: 'bean-1',
        name: 'Kenya One',
        roasterId: 'r1',
        roasterName: 'North',
        city: 'Shanghai',
        originCountry: 'Kenya',
        originRegion: 'Nyeri',
        farm: '',
        variety: 'sl28',
        process: 'Washed',
        roastLevel: 'Light',
        price: 90,
        discountedPrice: 90,
        currency: 'CNY',
        salesCount: 20,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: true,
      },
      {
        id: 'bean-2',
        name: 'Kenya Two',
        roasterId: 'r2',
        roasterName: 'South',
        city: 'Beijing',
        originCountry: 'Kenya',
        originRegion: 'Nyeri',
        farm: '',
        variety: 'SL 28',
        process: 'Washed',
        roastLevel: 'Light',
        price: 92,
        discountedPrice: 92,
        currency: 'CNY',
        salesCount: 18,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
      {
        id: 'bean-3',
        name: 'Kenya Mix',
        roasterId: 'r3',
        roasterName: 'West',
        city: 'Guangzhou',
        originCountry: 'Kenya',
        originRegion: 'Nyeri',
        farm: '',
        variety: 'SL28/SL34',
        process: 'Washed',
        roastLevel: 'Light',
        price: 95,
        discountedPrice: 95,
        currency: 'CNY',
        salesCount: 15,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
      {
        id: 'bean-4',
        name: 'Kenya Mix 2',
        roasterId: 'r4',
        roasterName: 'East',
        city: 'Shenzhen',
        originCountry: 'Kenya',
        originRegion: 'Nyeri',
        farm: '',
        variety: 'sl28 / sl34',
        process: 'Washed',
        roastLevel: 'Light',
        price: 96,
        discountedPrice: 96,
        currency: 'CNY',
        salesCount: 13,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
    ],
    filters: {},
  });

  assert.deepEqual(payload.varietyOptions, [
    { id: 'SL28', label: 'SL28', count: 4 },
    { id: 'SL34', label: 'SL34', count: 2 },
  ]);
});

test('buildBeanDiscoverPayload counts multi-value process options separately', () => {
  const payload = buildBeanDiscoverPayload({
    beans: [
      {
        id: 'bean-1',
        name: 'Mixed Process One',
        roasterId: 'r1',
        roasterName: 'North',
        city: 'Shanghai',
        originCountry: 'Kenya',
        originRegion: 'Nyeri',
        farm: '',
        variety: 'SL28',
        process: 'Washed / Natural',
        roastLevel: 'Light',
        price: 90,
        discountedPrice: 90,
        currency: 'CNY',
        salesCount: 20,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
      {
        id: 'bean-2',
        name: 'Mixed Process Two',
        roasterId: 'r2',
        roasterName: 'South',
        city: 'Beijing',
        originCountry: 'Ethiopia',
        originRegion: 'Guji',
        farm: '',
        variety: '74110',
        process: 'Anaerobic Washed / Natural',
        roastLevel: 'Light',
        price: 92,
        discountedPrice: 92,
        currency: 'CNY',
        salesCount: 18,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
    ],
    filters: {},
  });

  assert.deepEqual(payload.processBaseOptions.map((option) => [option.id, option.count]), [
    ['natural', 2],
    ['washed', 2],
  ]);
  assert.deepEqual(payload.processStyleOptions.map((option) => [option.id, option.count]), [
    ['traditional', 2],
    ['anaerobic', 1],
  ]);
});

test('buildBeanDiscoverPayload keeps only generic other style under other base', () => {
  const payload = buildBeanDiscoverPayload({
    beans: [
      {
        id: 'bean-yeast',
        name: 'Experimental Yeast',
        roasterId: 'r1',
        roasterName: 'North',
        city: 'Shanghai',
        originCountry: 'Colombia',
        originRegion: 'Huila',
        farm: '',
        variety: '',
        process: 'Yeast Inoculated',
        processBase: 'other',
        processStyle: 'yeast',
        roastLevel: 'Light',
        price: 98,
        discountedPrice: 98,
        currency: 'CNY',
        salesCount: 12,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: true,
      },
      {
        id: 'bean-carbonic',
        name: 'CM Lot',
        roasterId: 'r2',
        roasterName: 'South',
        city: 'Beijing',
        originCountry: 'Costa Rica',
        originRegion: 'Tarrazu',
        farm: '',
        variety: '',
        process: 'Carbonic Maceration',
        processBase: 'other',
        processStyle: 'carbonic_maceration',
        roastLevel: 'Light',
        price: 108,
        discountedPrice: 108,
        currency: 'CNY',
        salesCount: 10,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
      {
        id: 'bean-anaerobic',
        name: 'Anaerobic Natural',
        roasterId: 'r3',
        roasterName: 'West',
        city: 'Guangzhou',
        originCountry: 'Ethiopia',
        originRegion: 'Guji',
        farm: '',
        variety: '',
        process: 'Anaerobic Natural',
        processBase: 'other',
        processStyle: 'anaerobic',
        roastLevel: 'Light',
        price: 88,
        discountedPrice: 88,
        currency: 'CNY',
        salesCount: 8,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
      {
        id: 'bean-other',
        name: 'Mystery Process',
        roasterId: 'r4',
        roasterName: 'East',
        city: 'Shenzhen',
        originCountry: 'Panama',
        originRegion: 'Boquete',
        farm: '',
        variety: '',
        process: 'Fruit infusion',
        processBase: 'other',
        processStyle: 'other',
        roastLevel: 'Light',
        price: 128,
        discountedPrice: 128,
        currency: 'CNY',
        salesCount: 6,
        tastingNotes: [],
        imageUrl: null,
        isInStock: true,
        isNewArrival: false,
      },
    ],
    filters: {
      processBase: 'other',
    },
  });

  assert.deepEqual(
    payload.processStyleOptions.map((option) => option.id),
    ['other']
  );
});

test('buildNewArrivalFiltersPayload prefers favorites and falls back to beans', () => {
  const payload = buildNewArrivalFiltersPayload({
    beanFavorites: [
      { process: 'Washed', originCountry: 'Kenya' },
      { process: 'Washed', originCountry: 'Ethiopia' },
    ],
    roasterFavorites: [{ id: 'r1', name: 'North' }],
    fallbackBeans: [
      { roasterId: 'r2', roasterName: 'South', process: 'Natural', originCountry: 'Brazil' },
      { roasterId: 'r2', roasterName: 'South', process: 'Natural', originCountry: 'Brazil' },
    ],
  });

  assert.equal(payload.mode, 'personalized');
  assert.deepEqual(payload.roasterOptions, [{ id: 'r1', label: 'North', count: 1 }]);
  assert.deepEqual(payload.processOptions, [{ id: 'Washed', label: 'Washed', count: 2 }]);
  assert.deepEqual(payload.originOptions, [
    { id: 'Ethiopia', label: 'Ethiopia', count: 1 },
    { id: 'Kenya', label: 'Kenya', count: 1 },
  ]);
});

test('mapRoasterSummary and mapRoasterDetail keep bean list attached for detail page', () => {
  const row = {
    id: 'r1',
    name: 'North',
    city: 'Shanghai',
    description: 'Clean and bright roasts.',
    logo_url: 'https://img.example/logo.jpg',
    website_url: 'https://north.example',
    instagram_handle: 'northroaster',
  };
  const aggregate = {
    beanCount: 2,
    coverImageUrl: 'https://img.example/cover.jpg',
    taobaoUrl: 'https://shop.taobao.com/north',
    xiaohongshuUrl: null,
  };

  const summary = mapRoasterSummary(row, aggregate);
  const detail = mapRoasterDetail(row, aggregate, [
    {
      id: 'bean-1',
      name: 'Kenya AA',
      roasterId: 'r1',
      roasterName: 'North',
      city: 'Shanghai',
      originCountry: 'Kenya',
      process: 'Washed',
      roastLevel: 'Light',
      price: 90,
      currency: 'CNY',
      salesCount: 20,
      imageUrl: null,
      isInStock: true,
      originRegion: 'Nyeri',
      farm: '',
      variety: '',
      discountedPrice: 90,
      tastingNotes: [],
      isNewArrival: true,
    },
  ]);

  assert.equal(summary.beanCount, 2);
  assert.equal(summary.coverImageUrl, 'https://img.example/cover.jpg');
  assert.equal(detail.websiteUrl, 'https://north.example');
  assert.equal(detail.beans?.[0]?.id, 'bean-1');
});

type MockFilter =
  | { kind: 'eq'; column: string; value: unknown }
  | { kind: 'ilike'; column: string; value: string }
  | { kind: 'or'; value: string }
  | { kind: 'gte'; column: string; value: string }
  | { kind: 'in'; column: string; values: unknown[] };

function createCatalogClient(
  rows: Array<Record<string, unknown>>,
  options?: {
    supportsNormalizedProcessColumns?: boolean;
  }
) {
  const calls: string[] = [];
  const supportsNormalizedProcessColumns = options?.supportsNormalizedProcessColumns === true;

  function createQuery(selectClause: string, state?: {
    filters: MockFilter[];
    range?: { from: number; to: number };
    count?: 'exact';
  }) {
    const nextState = state ?? { filters: [] as MockFilter[] };

    const query = {
      eq(column: string, value: unknown) {
        nextState.filters.push({ kind: 'eq', column, value });
        return query;
      },
      ilike(column: string, value: string) {
        nextState.filters.push({ kind: 'ilike', column, value });
        return query;
      },
      or(value: string) {
        nextState.filters.push({ kind: 'or', value });
        return query;
      },
      gte(column: string, value: string) {
        nextState.filters.push({ kind: 'gte', column, value });
        return query;
      },
      order() {
        return query;
      },
      limit() {
        return query;
      },
      range(from: number, to: number) {
        nextState.range = { from, to };
        return query;
      },
      maybeSingle() {
        return query;
      },
      then(onFulfilled: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
        const hasNormalizedColumns = selectClause.includes('process_base') || selectClause.includes('process_style');

        if (hasNormalizedColumns && !supportsNormalizedProcessColumns) {
          return Promise.resolve({
            data: null,
            error: {
              message: "Could not find the 'process_base' column of 'v_catalog_active' in the schema cache",
            },
            count: null,
          }).then(onFulfilled, onRejected);
        }

        let data = rows.slice();
        for (const filter of nextState.filters) {
          if (filter.kind === 'eq' && filter.column === 'roaster_id') {
            data = data.filter((row) => row.roaster_id === filter.value);
          }
          if (filter.kind === 'eq' && filter.column === 'roaster_bean_id') {
            data = data.filter((row) => row.roaster_bean_id === filter.value);
          }
          if (filter.kind === 'eq' && filter.column === 'process_base') {
            data = data.filter((row) => row.process_base === filter.value);
          }
          if (filter.kind === 'eq' && filter.column === 'process_style') {
            data = data.filter((row) => row.process_style === filter.value);
          }
        }

        const count = data.length;
        if (nextState.range) {
          data = data.slice(nextState.range.from, nextState.range.to + 1);
        }

        return Promise.resolve({
          data,
          error: null,
          count: nextState.count === 'exact' ? count : null,
        }).then(onFulfilled, onRejected);
      },
    };

    return query;
  }

  return {
    calls,
    from(table: string) {
      assert.equal(table, 'v_catalog_active');
      return {
        select(selectClause: string, options?: { count?: 'exact' }) {
          calls.push(selectClause);
          return createQuery(selectClause, {
            filters: [],
            count: options?.count,
          });
        },
      };
    },
  };
}

function createLegacyCatalogClient(rows: Array<Record<string, unknown>>) {
  return createCatalogClient(rows, {
    supportsNormalizedProcessColumns: false,
  });
}

test('listBeansWithSupabase falls back when legacy view lacks normalized process columns', async () => {
  const client = createLegacyCatalogClient([
    {
      roaster_bean_id: 'bean-1',
      roaster_id: 'roaster-1',
      roaster_name: 'Roaster One',
      city: 'Shanghai',
      display_name: 'Ethiopia Guji',
      origin_country: 'Ethiopia',
      origin_region: 'Guji',
      farm: 'Halo',
      variety: '74110',
      process_method: 'Washed',
      roast_level: 'Light',
      price_amount: '88',
      price_currency: 'CNY',
      sales_count: 120,
      image_url: 'https://img.example/bean.jpg',
      is_in_stock: true,
      updated_at: '2026-03-20T00:00:00.000Z',
    },
  ]);

  const result = await listBeansWithSupabase(client as never, {
    page: 1,
    pageSize: 20,
  });

  assert.equal(client.calls.length, 2);
  assert.equal(client.calls[0]?.includes('process_base'), true);
  assert.equal(client.calls[1]?.includes('process_base'), false);
  assert.equal(result.items[0]?.processBase, 'washed');
  assert.equal(result.items[0]?.processStyle, 'traditional');
  assert.equal(result.pageInfo.total, 1);
});

test('listBeansWithSupabase applies process filters locally after legacy fallback', async () => {
  const client = createLegacyCatalogClient([
    {
      roaster_bean_id: 'bean-1',
      roaster_id: 'roaster-1',
      roaster_name: 'Roaster One',
      city: 'Shanghai',
      display_name: 'Ethiopia Guji',
      origin_country: 'Ethiopia',
      origin_region: 'Guji',
      farm: 'Halo',
      variety: '74110',
      process_method: 'Washed',
      roast_level: 'Light',
      price_amount: '88',
      price_currency: 'CNY',
      sales_count: 120,
      image_url: 'https://img.example/bean.jpg',
      is_in_stock: true,
      updated_at: '2026-03-20T00:00:00.000Z',
    },
    {
      roaster_bean_id: 'bean-2',
      roaster_id: 'roaster-2',
      roaster_name: 'Roaster Two',
      city: 'Beijing',
      display_name: 'Brazil Sunset',
      origin_country: 'Brazil',
      origin_region: 'Minas Gerais',
      farm: 'Vista',
      variety: 'Bourbon',
      process_method: 'Natural',
      roast_level: 'Medium',
      price_amount: '78',
      price_currency: 'CNY',
      sales_count: 60,
      image_url: 'https://img.example/bean-2.jpg',
      is_in_stock: true,
      updated_at: '2026-03-18T00:00:00.000Z',
    },
  ]);

  const result = await listBeansWithSupabase(client as never, {
    page: 1,
    pageSize: 20,
    processBase: 'washed',
  });

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0]?.id, 'bean-1');
  assert.equal(result.pageInfo.total, 1);
});

test('listBeansWithSupabase merges equivalent variety labels when filtering', async () => {
  const client = createLegacyCatalogClient([
    {
      roaster_bean_id: 'bean-1',
      roaster_id: 'roaster-1',
      roaster_name: 'Roaster One',
      city: 'Shanghai',
      display_name: 'Kenya One',
      origin_country: 'Kenya',
      origin_region: 'Nyeri',
      farm: 'Hill',
      variety: 'sl28',
      process_method: 'Washed',
      roast_level: 'Light',
      price_amount: '88',
      price_currency: 'CNY',
      sales_count: 120,
      image_url: 'https://img.example/bean.jpg',
      is_in_stock: true,
      updated_at: '2026-03-20T00:00:00.000Z',
    },
    {
      roaster_bean_id: 'bean-2',
      roaster_id: 'roaster-2',
      roaster_name: 'Roaster Two',
      city: 'Beijing',
      display_name: 'Kenya Two',
      origin_country: 'Kenya',
      origin_region: 'Nyeri',
      farm: 'Hill',
      variety: 'SL 28',
      process_method: 'Washed',
      roast_level: 'Light',
      price_amount: '86',
      price_currency: 'CNY',
      sales_count: 80,
      image_url: 'https://img.example/bean-2.jpg',
      is_in_stock: true,
      updated_at: '2026-03-18T00:00:00.000Z',
    },
    {
      roaster_bean_id: 'bean-3',
      roaster_id: 'roaster-3',
      roaster_name: 'Roaster Three',
      city: 'Guangzhou',
      display_name: 'Brazil Bourbon',
      origin_country: 'Brazil',
      origin_region: 'Minas Gerais',
      farm: 'Vista',
      variety: 'Bourbon',
      process_method: 'Natural',
      roast_level: 'Medium',
      price_amount: '78',
      price_currency: 'CNY',
      sales_count: 60,
      image_url: 'https://img.example/bean-3.jpg',
      is_in_stock: true,
      updated_at: '2026-03-17T00:00:00.000Z',
    },
  ]);

  const result = await listBeansWithSupabase(client as never, {
    page: 1,
    pageSize: 20,
    variety: 'SL28',
  });

  assert.deepEqual(
    result.items.map((bean) => bean.id),
    ['bean-1', 'bean-2']
  );
  assert.equal(result.pageInfo.total, 2);
});

test('listBeansWithSupabase matches one selected variety inside a multi-value variety field', async () => {
  const client = createLegacyCatalogClient([
    {
      roaster_bean_id: 'bean-1',
      roaster_id: 'roaster-1',
      roaster_name: 'Roaster One',
      city: 'Shanghai',
      display_name: 'Kenya Mix',
      origin_country: 'Kenya',
      origin_region: 'Nyeri',
      farm: 'Hill',
      variety: 'SL28 / SL34',
      process_method: 'Washed',
      roast_level: 'Light',
      price_amount: '88',
      price_currency: 'CNY',
      sales_count: 120,
      image_url: 'https://img.example/bean.jpg',
      is_in_stock: true,
      updated_at: '2026-03-20T00:00:00.000Z',
    },
  ]);

  const result = await listBeansWithSupabase(client as never, {
    page: 1,
    pageSize: 20,
    variety: 'SL28',
  });

  assert.deepEqual(
    result.items.map((bean) => bean.id),
    ['bean-1']
  );
  assert.equal(result.pageInfo.total, 1);
});

test('listBeansWithSupabase applies process filters locally when a bean exposes multiple process options', async () => {
  const client = createCatalogClient(
    [
      {
        roaster_bean_id: 'bean-1',
        roaster_id: 'roaster-1',
        roaster_name: 'Roaster One',
        city: 'Shanghai',
        display_name: 'Process Mix',
        origin_country: 'Ethiopia',
        origin_region: 'Guji',
        farm: 'Halo',
        variety: '74110',
        process_method: 'Washed / Natural',
        process_base: 'washed',
        process_style: 'traditional',
        roast_level: 'Light',
        price_amount: '88',
        price_currency: 'CNY',
        sales_count: 120,
        image_url: 'https://img.example/bean.jpg',
        is_in_stock: true,
        updated_at: '2026-03-20T00:00:00.000Z',
      },
    ],
    {
      supportsNormalizedProcessColumns: true,
    }
  );

  const result = await listBeansWithSupabase(client as never, {
    page: 1,
    pageSize: 20,
    processBase: 'natural',
  });

  assert.deepEqual(
    result.items.map((bean) => bean.id),
    ['bean-1']
  );
  assert.equal(result.pageInfo.total, 1);
});

test('listBeansWithSupabase paginates after local process filtering instead of filtering only the first page', async () => {
  const rows = Array.from({ length: 21 }, (_, index) => ({
    roaster_bean_id: `bean-${index + 1}`,
    roaster_id: `roaster-${index + 1}`,
    roaster_name: `Roaster ${index + 1}`,
    city: 'Shanghai',
    display_name: `Bean ${index + 1}`,
    origin_country: index === 20 ? 'Ethiopia' : 'Brazil',
    origin_region: index === 20 ? 'Guji' : 'Sul de Minas',
    farm: 'Farm',
    variety: index === 20 ? '74110' : 'Bourbon',
    process_method: index === 20 ? 'Washed' : 'Natural',
    process_base: index === 20 ? 'washed' : 'natural',
    process_style: 'traditional',
    roast_level: 'Light',
    price_amount: '88',
    price_currency: 'CNY',
    sales_count: 120 - index,
    image_url: `https://img.example/bean-${index + 1}.jpg`,
    is_in_stock: true,
    updated_at: `2026-03-${String(29 - index).padStart(2, '0')}T00:00:00.000Z`,
  }));

  const client = createCatalogClient(rows, {
    supportsNormalizedProcessColumns: true,
  });

  const result = await listBeansWithSupabase(client as never, {
    page: 1,
    pageSize: 20,
    processBase: 'washed',
  });

  assert.deepEqual(
    result.items.map((bean) => bean.id),
    ['bean-21']
  );
  assert.equal(result.pageInfo.total, 1);
});

function createNewArrivalScopedClient(options: {
  catalogRows: Array<Record<string, unknown>>;
  latestJobId: string | null;
  ingestionEvents: Array<{ entity_id: string | null; action: string | null }>;
}) {
  function createCatalogQuery(state?: {
    filters: MockFilter[];
    range?: { from: number; to: number };
    count?: 'exact';
  }) {
    const nextState = state ?? { filters: [] as MockFilter[] };

    const query = {
      eq(column: string, value: unknown) {
        nextState.filters.push({ kind: 'eq', column, value });
        return query;
      },
      ilike(column: string, value: string) {
        nextState.filters.push({ kind: 'ilike', column, value });
        return query;
      },
      or(value: string) {
        nextState.filters.push({ kind: 'or', value });
        return query;
      },
      gte(column: string, value: string) {
        nextState.filters.push({ kind: 'gte', column, value });
        return query;
      },
      in(column: string, values: unknown[]) {
        nextState.filters.push({ kind: 'in', column, values });
        return query;
      },
      order() {
        return query;
      },
      limit() {
        return query;
      },
      range(from: number, to: number) {
        nextState.range = { from, to };
        return query;
      },
      maybeSingle() {
        const filtered = nextState.filters.reduce<Array<Record<string, unknown>>>((rows, filter) => {
          if (filter.kind === 'eq') {
            return rows.filter((row) => row[filter.column] === filter.value);
          }
          return rows;
        }, options.catalogRows.slice());

        const row = filtered[0] ?? null;
        return Promise.resolve({ data: row, error: null, count: null });
      },
      then(onFulfilled: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
        let data = options.catalogRows.slice();

        for (const filter of nextState.filters) {
          if (filter.kind === 'eq') {
            data = data.filter((row) => row[filter.column] === filter.value);
          }
          if (filter.kind === 'in') {
            data = data.filter((row) => filter.values.includes(row[filter.column]));
          }
        }

        const count = data.length;
        if (nextState.range) {
          data = data.slice(nextState.range.from, nextState.range.to + 1);
        }

        return Promise.resolve({
          data,
          error: null,
          count: nextState.count === 'exact' ? count : null,
        }).then(onFulfilled, onRejected);
      },
    };

    return query;
  }

  return {
    rpc(name: string) {
      assert.equal(name, 'latest_synced_new_arrival_ids');
      return Promise.resolve({
        data: options.ingestionEvents
          .filter((row) => row.action === 'INSERT' || row.action === 'UPSERT')
          .map((row) => ({ roaster_bean_id: row.entity_id })),
        error: null,
      });
    },
    from(table: string) {
      if (table === 'v_catalog_active') {
        return {
          select(_selectClause: string, options?: { count?: 'exact' }) {
            return createCatalogQuery({
              filters: [],
              count: options?.count,
            });
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };
}

test('listBeansWithSupabase scopes new arrivals to the latest sync job instead of recent updated_at rows', async () => {
  const client = createNewArrivalScopedClient({
    catalogRows: [
      {
        roaster_bean_id: 'bean-latest-sync',
        roaster_id: 'roaster-1',
        roaster_name: 'Roaster One',
        city: 'Shanghai',
        display_name: 'Latest Sync Bean',
        origin_country: 'Ethiopia',
        origin_region: 'Guji',
        farm: 'Halo',
        variety: '74110',
        process_method: 'Washed',
        process_base: 'washed',
        process_style: 'traditional',
        roast_level: 'Light',
        price_amount: '88',
        price_currency: 'CNY',
        sales_count: 120,
        image_url: 'https://img.example/bean-1.jpg',
        is_in_stock: true,
        updated_at: '2026-03-20T00:00:00.000Z',
      },
      {
        roaster_bean_id: 'bean-recent-but-old-batch',
        roaster_id: 'roaster-2',
        roaster_name: 'Roaster Two',
        city: 'Beijing',
        display_name: 'Recent Update Bean',
        origin_country: 'Kenya',
        origin_region: 'Nyeri',
        farm: 'Hill',
        variety: 'SL28',
        process_method: 'Natural',
        process_base: 'natural',
        process_style: 'traditional',
        roast_level: 'Light',
        price_amount: '96',
        price_currency: 'CNY',
        sales_count: 90,
        image_url: 'https://img.example/bean-2.jpg',
        is_in_stock: true,
        updated_at: '2026-03-19T00:00:00.000Z',
      },
    ],
    latestJobId: 'job-1',
    ingestionEvents: [{ entity_id: 'bean-latest-sync', action: 'INSERT' }],
  });

  const result = await listBeansWithSupabase(client as never, {
    page: 1,
    pageSize: 20,
    isNewArrival: true,
  });

  assert.deepEqual(
    result.items.map((bean) => bean.id),
    ['bean-latest-sync']
  );
  assert.equal(result.pageInfo.total, 1);
  assert.equal(result.items[0]?.isNewArrival, true);
});

test('listBeansWithSupabase reads latest new arrivals through public rpc instead of private tables', async () => {
  const client = {
    rpc(name: string) {
      assert.equal(name, 'latest_synced_new_arrival_ids');
      return Promise.resolve({
        data: [{ roaster_bean_id: 'bean-public-rpc' }],
        error: null,
      });
    },
    from(table: string) {
      if (table === 'import_jobs' || table === 'ingestion_events') {
        throw new Error(`should not read private table ${table} from miniprogram client`);
      }

      if (table === 'v_catalog_active') {
        const filters: MockFilter[] = [];

        const query = {
          select(_selectClause: string, options?: { count?: 'exact' }) {
            return {
              eq(column: string, value: unknown) {
                filters.push({ kind: 'eq', column, value });
                return this;
              },
              ilike() {
                return this;
              },
              or() {
                return this;
              },
              gte() {
                return this;
              },
              in(column: string, values: unknown[]) {
                filters.push({ kind: 'in', column, values });
                return this;
              },
              order() {
                return this;
              },
              range() {
                return this;
              },
              then(onFulfilled: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
                let data = [
                  {
                    roaster_bean_id: 'bean-public-rpc',
                    roaster_id: 'roaster-1',
                    roaster_name: 'Roaster One',
                    city: 'Shanghai',
                    display_name: 'RPC Bean',
                    origin_country: 'Ethiopia',
                    origin_region: 'Guji',
                    farm: 'Halo',
                    variety: '74110',
                    process_method: 'Washed',
                    process_base: 'washed',
                    process_style: 'traditional',
                    roast_level: 'Light',
                    price_amount: '88',
                    price_currency: 'CNY',
                    sales_count: 120,
                    image_url: 'https://img.example/bean-rpc.jpg',
                    is_in_stock: true,
                    updated_at: '2026-03-27T09:27:08.612822+00:00',
                  },
                ];

                for (const filter of filters) {
                  if (filter.kind === 'in') {
                    data = data.filter((row) => filter.values.includes(row[filter.column as keyof typeof row]));
                  }
                }

                return Promise.resolve({
                  data,
                  error: null,
                  count: options?.count === 'exact' ? data.length : null,
                }).then(onFulfilled, onRejected);
              },
            };
          },
        };

        return query;
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };

  const result = await listBeansWithSupabase(client as never, {
    page: 1,
    pageSize: 20,
    isNewArrival: true,
  });

  assert.deepEqual(result.items.map((bean) => bean.id), ['bean-public-rpc']);
  assert.equal(result.pageInfo.total, 1);
});

test('getNewArrivalFiltersWithSupabase skips catalog query when latest sync has no new arrival ids', async () => {
  let catalogQueryCount = 0;

  const client = {
    rpc(name: string) {
      assert.equal(name, 'latest_synced_new_arrival_ids');
      return Promise.resolve({
        data: [],
        error: null,
      });
    },
    from(table: string) {
      if (table === 'v_catalog_active') {
        catalogQueryCount += 1;
        return {
          select() {
            throw new Error('v_catalog_active should not be queried when there are no latest new arrival ids');
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  };

  const payload = await getNewArrivalFiltersWithSupabase(client as never, {
    beanFavorites: [{ process: 'Washed', originCountry: 'Kenya' }],
    roasterFavorites: [{ id: 'roaster-1', name: 'North' }],
  });

  assert.equal(catalogQueryCount, 0);
  assert.equal(payload.mode, 'personalized');
  assert.deepEqual(payload.roasterOptions, [{ id: 'roaster-1', label: 'North', count: 1 }]);
  assert.deepEqual(payload.processOptions, [{ id: 'Washed', label: 'Washed', count: 1 }]);
  assert.deepEqual(payload.originOptions, [{ id: 'Kenya', label: 'Kenya', count: 1 }]);
});
