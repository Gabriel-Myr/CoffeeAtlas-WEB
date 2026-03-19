import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

type CoffeeBean = {
  id: string;
  name: string;
  roasterId: string;
  roasterName: string;
  city: string;
  originCountry: string;
  originRegion: string;
  farm: string;
  variety: string;
  process: string;
  roastLevel: string;
  price: number;
  discountedPrice: number;
  currency: string;
  salesCount: number;
  tastingNotes: string[];
  imageUrl: string | null;
  isInStock: boolean;
  isNewArrival: boolean;
};

function createSampleBeans(): CoffeeBean[] {
  return [
    {
      id: 'rb-1',
      name: 'Ethiopia Guji Jasmine',
      roasterId: 'r-1',
      roasterName: 'Cloud Roaster',
      city: 'Shanghai',
      originCountry: 'Ethiopia',
      originRegion: 'Guji',
      farm: '',
      variety: 'Heirloom',
      process: 'Washed',
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
      id: 'rb-2',
      name: 'Colombia Peach',
      roasterId: 'r-2',
      roasterName: 'Peak Beans',
      city: 'Hangzhou',
      originCountry: 'Colombia',
      originRegion: 'Huila',
      farm: '',
      variety: 'Caturra',
      process: 'Natural',
      roastLevel: 'Medium',
      price: 92,
      discountedPrice: 92,
      currency: 'CNY',
      salesCount: 8,
      tastingNotes: [],
      imageUrl: null,
      isInStock: true,
      isNewArrival: false,
    },
  ];
}

function createSupabaseStubModuleSource(): string {
  return `
const roasterBeans = [
  {
    id: 'rb-1',
    display_name: 'Ethiopia Guji Jasmine',
    roaster_id: 'r-1',
    bean_id: 'b-1',
    roast_level: 'Light',
    price_amount: 108,
    price_currency: 'CNY',
    sales_count: 10,
    image_url: null,
    is_in_stock: true,
    status: 'ACTIVE',
    updated_at: '2026-03-19T10:00:00.000Z',
  },
  {
    id: 'rb-2',
    display_name: 'Colombia Peach',
    roaster_id: 'r-2',
    bean_id: 'b-2',
    roast_level: 'Medium',
    price_amount: 92,
    price_currency: 'CNY',
    sales_count: 8,
    image_url: null,
    is_in_stock: true,
    status: 'ACTIVE',
    updated_at: '2026-03-18T10:00:00.000Z',
  },
  {
    id: 'rb-hidden',
    display_name: 'Hidden Panama Lot',
    roaster_id: 'r-hidden',
    bean_id: 'b-hidden',
    roast_level: 'Light',
    price_amount: 168,
    price_currency: 'CNY',
    sales_count: 2,
    image_url: null,
    is_in_stock: true,
    status: 'ACTIVE',
    updated_at: '2026-03-17T10:00:00.000Z',
  },
];

const catalogRows = [
  {
    roaster_bean_id: 'rb-1',
    roaster_id: 'r-1',
    roaster_name: 'Cloud Roaster',
    city: 'Shanghai',
    bean_id: 'b-1',
    bean_name: 'Guji',
    origin_country: 'Ethiopia',
    origin_region: 'Guji',
    farm: '',
    process_method: 'Washed',
    variety: 'Heirloom',
    display_name: 'Ethiopia Guji Jasmine',
    roast_level: 'Light',
    price_amount: 108,
    price_currency: 'CNY',
    sales_count: 10,
    image_url: null,
    is_in_stock: true,
    updated_at: '2026-03-19T10:00:00.000Z',
  },
  {
    roaster_bean_id: 'rb-2',
    roaster_id: 'r-2',
    roaster_name: 'Peak Beans',
    city: 'Hangzhou',
    bean_id: 'b-2',
    bean_name: 'Huila',
    origin_country: 'Colombia',
    origin_region: 'Huila',
    farm: '',
    process_method: 'Natural',
    variety: 'Caturra',
    display_name: 'Colombia Peach',
    roast_level: 'Medium',
    price_amount: 92,
    price_currency: 'CNY',
    sales_count: 8,
    image_url: null,
    is_in_stock: true,
    updated_at: '2026-03-18T10:00:00.000Z',
  },
];

const roasters = [
  { id: 'r-1', name: 'Cloud Roaster', city: 'Shanghai', description: null, logo_url: null, website_url: null, instagram_handle: null },
  { id: 'r-2', name: 'Peak Beans', city: 'Hangzhou', description: null, logo_url: null, website_url: null, instagram_handle: null },
];

const beans = [
  { id: 'b-1', canonical_name: 'Guji', origin_country: 'Ethiopia', origin_region: 'Guji', farm: '', variety: 'Heirloom', process_method: 'Washed', flavor_tags: [] },
  { id: 'b-2', canonical_name: 'Huila', origin_country: 'Colombia', origin_region: 'Huila', farm: '', variety: 'Caturra', process_method: 'Natural', flavor_tags: [] },
];

function makeQuery(table) {
  const state = {
    selectOptions: undefined,
    filters: [],
    range: undefined,
    maybeSingle: false,
  };

  const query = {
    select(_columns, options) {
      state.selectOptions = options;
      return query;
    },
    eq(column, value) {
      state.filters.push({ kind: 'eq', column, value });
      return query;
    },
    in(column, value) {
      state.filters.push({ kind: 'in', column, value });
      return query;
    },
    ilike(column, value) {
      state.filters.push({ kind: 'ilike', column, value });
      return query;
    },
    order() {
      return query;
    },
    range(from, to) {
      state.range = { from, to };
      return query;
    },
    or() {
      return query;
    },
    maybeSingle() {
      state.maybeSingle = true;
      return query;
    },
    then(onFulfilled, onRejected) {
      return Promise.resolve(resolveResult(table, state)).then(onFulfilled, onRejected);
    },
  };

  return query;
}

function resolveResult(table, state) {
  if (table === 'v_catalog_active') {
    let data = catalogRows.slice();

    for (const filter of state.filters) {
      if (filter.kind === 'eq' && filter.column === 'roaster_id') {
        data = data.filter((row) => row.roaster_id === filter.value);
      }
      if (filter.kind === 'eq' && filter.column === 'roaster_bean_id') {
        data = data.filter((row) => row.roaster_bean_id === filter.value);
      }
      if (filter.kind === 'ilike' && filter.column === 'roast_level') {
        data = data.filter((row) => row.roast_level === filter.value);
      }
      if (filter.kind === 'in' && filter.column === 'roaster_bean_id') {
        data = data.filter((row) => filter.value.includes(row.roaster_bean_id));
      }
      if (filter.kind === 'in' && filter.column === 'bean_id') {
        data = data.filter((row) => filter.value.includes(row.bean_id));
      }
    }

    if (state.selectOptions?.count === 'exact' && state.selectOptions?.head) {
      return { count: data.length, error: null };
    }

    if (state.range) {
      data = data.slice(state.range.from, state.range.to + 1);
    }

    if (state.maybeSingle) {
      return { data: data[0] ?? null, error: null };
    }

    return { data, error: null };
  }

  if (table === 'roasters') {
    const idFilter = state.filters.find((filter) => filter.kind === 'in' && filter.column === 'id');
    const ids = Array.isArray(idFilter?.value) ? idFilter.value : null;
    return { data: ids ? roasters.filter((row) => ids.includes(row.id)) : roasters, error: null };
  }

  if (table === 'beans') {
    const idFilter = state.filters.find((filter) => filter.kind === 'in' && filter.column === 'id');
    const ids = Array.isArray(idFilter?.value) ? idFilter.value : null;
    return { data: ids ? beans.filter((row) => ids.includes(row.id)) : beans, error: null };
  }

  if (table === 'roaster_beans') {
    if (state.selectOptions?.count === 'exact' && state.selectOptions?.head) {
      return { count: roasterBeans.length, error: null };
    }

    let data = roasterBeans.slice();
    for (const filter of state.filters) {
      if (filter.kind === 'eq' && filter.column === 'status') {
        data = data.filter((row) => row.status === filter.value);
      }
      if (filter.kind === 'eq' && filter.column === 'roaster_id') {
        data = data.filter((row) => row.roaster_id === filter.value);
      }
      if (filter.kind === 'in' && filter.column === 'id') {
        data = data.filter((row) => filter.value.includes(row.id));
      }
    }
    if (state.range) {
      data = data.slice(state.range.from, state.range.to + 1);
    }
    return { data, error: null };
  }

  throw new Error(\`Unexpected table: \${table}\`);
}

const supabaseServer = {
  rpc(name) {
    if (name === 'search_catalog') {
      return Promise.resolve({ data: [{ roaster_bean_id: 'rb-1' }], error: null });
    }
    if (name === 'search_catalog_count') {
      return Promise.resolve({ data: 1, error: null });
    }
    throw new Error(\`Unexpected rpc: \${name}\`);
  },
  from(table) {
    return makeQuery(table);
  },
};

export const hasSupabaseServerEnv = true;
export function requireSupabaseServer() {
  return supabaseServer;
}
`;
}

function createFallbackSupabaseStubModuleSource(): string {
  return `
export const hasSupabaseServerEnv = false;
export function requireSupabaseServer() {
  throw new Error('Missing server-side Supabase configuration');
}
`;
}

function createCatalogCoreStubModuleSource(sampleBeans: CoffeeBean[]): string {
  return `
const sampleBeans = ${JSON.stringify(sampleBeans)};

export const BeanRow = undefined;
export const RoasterBeanRow = undefined;
export const RoasterRow = undefined;
export const SearchCatalogRow = undefined;

export function createCatalogError(message) {
  return new Error(\`catalog:\${message}\`);
}

export function getSampleBeans() {
  return sampleBeans;
}

export function mapCoffeeBean(row, roaster, bean, latestNewArrivalIds) {
  return {
    id: row.id,
    name: row.display_name,
    roasterId: row.roaster_id ?? '',
    roasterName: roaster?.name ?? '',
    city: roaster?.city ?? '',
    originCountry: bean?.origin_country ?? '',
    originRegion: bean?.origin_region ?? '',
    farm: bean?.farm ?? '',
    variety: bean?.variety ?? '',
    process: bean?.process_method ?? '',
    roastLevel: row.roast_level ?? '',
    price: Number(row.price_amount ?? 0),
    discountedPrice: Number(row.price_amount ?? 0),
    currency: row.price_currency ?? 'CNY',
    salesCount: Number(row.sales_count ?? 0),
    tastingNotes: bean?.flavor_tags ?? [],
    imageUrl: row.image_url,
    isInStock: row.is_in_stock ?? true,
    isNewArrival: latestNewArrivalIds?.has(row.id) ?? false,
  };
}
`;
}

async function loadCatalogBeansModule(options: { hasSupabaseServerEnv: boolean; sampleBeans: CoffeeBean[] }) {
  const sourceUrl = new URL('../lib/catalog-beans.ts', import.meta.url);
  const source = readFileSync(sourceUrl, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const tmpDir = mkdtempSync(join(tmpdir(), 'catalog-search-test-'));
  const tempCatalogBeansPath = join(tmpDir, 'catalog-beans.mjs');
  const tempNewArrivalsPath = join(tmpDir, 'new-arrivals.stub.mjs');
  const tempSupabasePath = join(tmpDir, 'supabase.stub.mjs');
  const tempCorePath = join(tmpDir, 'catalog-core.stub.mjs');
  const catalogQueryUrl = new URL('../lib/catalog-query.ts', import.meta.url).href;

  const rewritten = transpiled
    .replaceAll("'@/lib/new-arrivals'", "'./new-arrivals.stub.mjs'")
    .replaceAll("'@/lib/supabase'", "'./supabase.stub.mjs'")
    .replaceAll("'./catalog-core.ts'", "'./catalog-core.stub.mjs'")
    .replaceAll("'./catalog-query.ts'", `'${catalogQueryUrl}'`);

  writeFileSync(tempCatalogBeansPath, rewritten);
  writeFileSync(tempNewArrivalsPath, "export async function getLatestSyncedNewArrivalBeanIdSet() { return new Set(); }\n");
  writeFileSync(
    tempSupabasePath,
    options.hasSupabaseServerEnv ? createSupabaseStubModuleSource() : createFallbackSupabaseStubModuleSource(),
  );
  writeFileSync(tempCorePath, createCatalogCoreStubModuleSource(options.sampleBeans));

  return import(`${pathToFileURL(tempCatalogBeansPath).href}?v=${Date.now()}-${Math.random()}`) as Promise<{
    getCatalogBeansPage: (query?: { limit?: number; offset?: number }) => Promise<CoffeeBean[]>;
    countCatalogBeans: () => Promise<number>;
    getBeanById: (id: string) => Promise<CoffeeBean | null>;
    searchCatalogBeans: (query: { query: string; limit?: number; offset?: number }) => Promise<CoffeeBean[]>;
    countSearchCatalogBeans: (query: string) => Promise<number>;
  }>;
}

test('blank list and count keep hidden rows out of the public catalog boundary', async () => {
  const catalogBeansModule = await loadCatalogBeansModule({
    hasSupabaseServerEnv: true,
    sampleBeans: createSampleBeans(),
  });

  const visibleList = await catalogBeansModule.getCatalogBeansPage({ limit: 10, offset: 0 });
  const visibleCount = await catalogBeansModule.countCatalogBeans();

  assert.deepEqual(
    visibleList.map((bean) => bean.id),
    ['rb-1', 'rb-2'],
  );
  assert.equal(visibleCount, 2);
});

test('getBeanById does not return hidden rows outside the public catalog boundary', async () => {
  const catalogBeansModule = await loadCatalogBeansModule({
    hasSupabaseServerEnv: true,
    sampleBeans: createSampleBeans(),
  });

  const visibleBean = await catalogBeansModule.getBeanById('rb-1');
  const hiddenBean = await catalogBeansModule.getBeanById('rb-hidden');

  assert.equal(visibleBean?.id, 'rb-1');
  assert.equal(hiddenBean, null);
});

test('search and count degrade to normal list/count when sanitized query is empty', async () => {
  const catalogBeansModule = await loadCatalogBeansModule({
    hasSupabaseServerEnv: true,
    sampleBeans: createSampleBeans(),
  });

  const expectedList = await catalogBeansModule.getCatalogBeansPage({ limit: 2, offset: 0 });
  const expectedCount = await catalogBeansModule.countCatalogBeans();
  const searchedList = await catalogBeansModule.searchCatalogBeans({ query: ' ,%() ', limit: 2, offset: 0 });
  const searchedCount = await catalogBeansModule.countSearchCatalogBeans(' ,%() ');

  assert.deepEqual(searchedList, expectedList);
  assert.equal(searchedCount, expectedCount);
});

test('sample fallback keeps list/count boundary consistent for search semantics', async () => {
  const catalogBeansModule = await loadCatalogBeansModule({
    hasSupabaseServerEnv: false,
    sampleBeans: createSampleBeans(),
  });

  const searchedList = await catalogBeansModule.searchCatalogBeans({ query: 'jasmine', limit: 10, offset: 0 });
  const searchedCount = await catalogBeansModule.countSearchCatalogBeans('jasmine');
  const blankList = await catalogBeansModule.searchCatalogBeans({ query: '    ', limit: 10, offset: 0 });
  const blankCount = await catalogBeansModule.countSearchCatalogBeans('    ');
  const normalList = await catalogBeansModule.getCatalogBeansPage({ limit: 10, offset: 0 });
  const normalCount = await catalogBeansModule.countCatalogBeans();

  assert.equal(searchedCount, searchedList.length);
  assert.deepEqual(blankList, normalList);
  assert.equal(blankCount, normalCount);
});

test('supabase search path should keep list result and total count on the same search semantics', async () => {
  const catalogBeansModule = await loadCatalogBeansModule({
    hasSupabaseServerEnv: true,
    sampleBeans: createSampleBeans(),
  });

  const searchedList = await catalogBeansModule.searchCatalogBeans({ query: 'jasmine washed', limit: 10, offset: 0 });
  const searchedCount = await catalogBeansModule.countSearchCatalogBeans('jasmine washed');

  assert.equal(
    searchedCount,
    searchedList.length,
    '同一 query 的 total 应与列表命中语义一致（当前应在此处暴露分叉）',
  );
});
