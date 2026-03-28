import test from 'node:test';
import assert from 'node:assert/strict';

import type {
  CatalogBeanFilters,
  CatalogBeansQuery,
  CoffeeBean,
  Roaster,
  RoastersQuery,
} from '../lib/catalog.ts';

type CatalogModule = typeof import('../lib/catalog.ts');

test('catalog type contracts remain compatible', () => {
  const beanId: CoffeeBean['id'] = 'bean-id';
  const roasterName: Roaster['name'] = 'Roaster Name';

  const filters: CatalogBeanFilters = {
    origin: 'Ethiopia',
    process: 'Washed',
  };

  const beansQuery: CatalogBeansQuery = {
    ...filters,
    limit: 5,
    offset: 10,
    roastLevel: 'Medium',
  };

  const roastersQuery: RoastersQuery = {
    limit: 3,
    city: 'Shanghai',
    q: 'espresso',
  };

  type AssertTrue<T extends true> = T;

  type BeansQueryHasPagination = CatalogBeansQuery extends CatalogBeanFilters & {
    limit?: number;
    offset?: number;
  }
    ? true
    : false;

  type GetRoastersType = CatalogModule['getRoasters'];
  type GetRoastersOverloadCheck = GetRoastersType extends {
    (limit?: number): Promise<Roaster[]>;
    (options?: RoastersQuery): Promise<Roaster[]>;
  }
    ? true
    : false;

  const assertBeansQueryHasPagination: AssertTrue<BeansQueryHasPagination> = true;
  const assertGetRoastersOverload: AssertTrue<GetRoastersOverloadCheck> = true;

  assert.equal(beanId, 'bean-id');
  assert.equal(roasterName, 'Roaster Name');
  assert.equal(filters.process, 'Washed');
  assert.equal(beansQuery.limit, 5);
  assert.equal(roastersQuery.q, 'espresso');
  assert.equal(assertBeansQueryHasPagination, true);
  assert.equal(assertGetRoastersOverload, true);
});
