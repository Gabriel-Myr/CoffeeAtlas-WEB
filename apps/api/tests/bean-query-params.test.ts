import assert from 'node:assert/strict';
import test from 'node:test';

import { HttpError } from '../lib/server/api-primitives.ts';
import { parseBeansQueryParams } from '../lib/server/bean-query-params.ts';

test('parseBeansQueryParams normalizes shared bean list filters', () => {
  const result = parseBeansQueryParams(
    new URLSearchParams(
      'page=2&pageSize=120&q=%E8%8A%B1%E9%A6%99&roasterId=roaster-1&origin=%E5%9F%83%E5%A1%9E%E4%BF%84%E6%AF%94%E4%BA%9A&process=%E6%B0%B4%E6%B4%97&processBase=washed&processStyle=anaerobic&roastLevel=%E6%B5%85%E7%83%98&sort=updated_desc&isNewArrival=true&continent=africa&country=ET'
    ),
    {
      defaultPageSize: 50,
      maxPageSize: 100,
      legacyLimitParam: 'limit',
    }
  );

  assert.deepEqual(result, {
    page: 2,
    pageSize: 100,
    q: '花香',
    roasterId: 'roaster-1',
    originCountry: '埃塞俄比亚',
    process: '水洗',
    processBase: 'washed',
    processStyle: 'anaerobic',
    roastLevel: '浅烘',
    sort: 'updated_desc',
    isNewArrival: true,
    continent: 'africa',
    country: 'ET',
  });
});

test('parseBeansQueryParams falls back to legacy limit and originCountry keys', () => {
  const result = parseBeansQueryParams(new URLSearchParams('page=3&limit=10&originCountry=%E5%B7%B4%E6%8B%BF%E9%A9%AC'), {
    legacyLimitParam: 'limit',
  });

  assert.deepEqual(result, {
    page: 3,
    pageSize: 10,
    q: undefined,
    roasterId: undefined,
    originCountry: '巴拿马',
    process: undefined,
    processBase: undefined,
    processStyle: undefined,
    roastLevel: undefined,
    sort: undefined,
    isNewArrival: undefined,
    continent: undefined,
    country: undefined,
  });
});

test('parseBeansQueryParams rejects invalid enum and boolean filters', () => {
  assert.throws(
    () => parseBeansQueryParams(new URLSearchParams('sort=latest')),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.equal(error.code, 'invalid_sort');
      return true;
    }
  );

  assert.throws(
    () => parseBeansQueryParams(new URLSearchParams('continent=europe')),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.equal(error.code, 'invalid_continent');
      return true;
    }
  );

  assert.throws(
    () => parseBeansQueryParams(new URLSearchParams('processBase=fermented')),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.equal(error.code, 'invalid_process_base');
      return true;
    }
  );

  assert.throws(
    () => parseBeansQueryParams(new URLSearchParams('processStyle=funky')),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.equal(error.code, 'invalid_process_style');
      return true;
    }
  );

  assert.throws(
    () => parseBeansQueryParams(new URLSearchParams('isNewArrival=yes')),
    (error: unknown) => {
      assert.ok(error instanceof HttpError);
      assert.equal(error.status, 400);
      assert.equal(error.code, 'invalid_isNewArrival');
      return true;
    }
  );
});
