import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildBeansPath,
  buildBeanDetailPath,
  buildBeanDiscoverPath,
} from '../dist/beans.js';
import { ApiClientError, extractApiErrorMessage, unwrapApiResponse } from '../dist/errors.js';
import { buildRoasterDetailPath, buildRoastersPath } from '../dist/roasters.js';

test('buildBeansPath serializes supported bean query params', () => {
  assert.equal(
    buildBeansPath({
      page: 2,
      pageSize: 20,
      q: '花香',
      sort: 'updated_desc',
      isNewArrival: true,
      country: '中国',
    }),
    '/api/v1/beans?page=2&pageSize=20&q=%E8%8A%B1%E9%A6%99&sort=updated_desc&isNewArrival=true&country=%E4%B8%AD%E5%9B%BD'
  );
});

test('buildBeanDiscoverPath omits empty query string when params missing', () => {
  assert.equal(buildBeanDiscoverPath(), '/api/v1/beans/discover');
});

test('buildBeanDiscoverPath serializes process base and style params', () => {
  assert.equal(
    buildBeanDiscoverPath({
      q: '花香',
      processBase: 'washed',
      processStyle: 'anaerobic',
      continent: 'africa',
      country: '埃塞俄比亚',
    }),
    '/api/v1/beans/discover?q=%E8%8A%B1%E9%A6%99&processBase=washed&processStyle=anaerobic&continent=africa&country=%E5%9F%83%E5%A1%9E%E4%BF%84%E6%AF%94%E4%BA%9A'
  );
});

test('build detail paths append the resource id', () => {
  assert.equal(buildBeanDetailPath('bean-1'), '/api/v1/beans/bean-1');
  assert.equal(buildRoasterDetailPath('roaster-9'), '/api/v1/roasters/roaster-9');
});

test('buildRoastersPath serializes supported roaster query params', () => {
  assert.equal(
    buildRoastersPath({
      page: 1,
      pageSize: 12,
      q: '上海',
      city: '上海',
      feature: 'taobao',
    }),
    '/api/v1/roasters?page=1&pageSize=12&q=%E4%B8%8A%E6%B5%B7&city=%E4%B8%8A%E6%B5%B7&feature=taobao'
  );
});

test('unwrapApiResponse returns data for success envelope', () => {
  const result = unwrapApiResponse({
    ok: true,
    data: { id: 'bean-1' },
    meta: { requestId: 'req-1' },
  });

  assert.deepEqual(result, { id: 'bean-1' });
});

test('unwrapApiResponse throws ApiClientError for error envelope', () => {
  assert.throws(
    () =>
      unwrapApiResponse({
        ok: false,
        error: {
          code: 'bad_request',
          message: '参数错误',
        },
        meta: {
          requestId: 'req-2',
        },
      }),
    (error: unknown) =>
      error instanceof ApiClientError &&
      error.message === '参数错误' &&
      error.code === 'bad_request' &&
      error.requestId === 'req-2'
  );
});

test('extractApiErrorMessage flattens mixed array and object payloads', () => {
  assert.equal(
    extractApiErrorMessage({
      error: [[], { message: '签名失效' }, { detail: '请重新登录' }],
    }),
    '[]；签名失效；请重新登录'
  );
});

test('extractApiErrorMessage serializes plain object errors instead of returning [object Object]', () => {
  assert.equal(
    extractApiErrorMessage({
      error: { status: 502, traceId: 'trace-1' },
    }),
    '{"status":502,"traceId":"trace-1"}'
  );
});
