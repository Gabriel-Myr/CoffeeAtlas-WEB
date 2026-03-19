import assert from 'node:assert/strict';
import test from 'node:test';

import { buildApiRequestOptions } from '../src/utils/api-request.ts';

test('buildApiRequestOptions keeps caller options while forcing stable transport defaults', () => {
  const options = buildApiRequestOptions({
    url: 'https://coffee-atlas-web-web.vercel.app/api/v1/beans',
    header: {
      Authorization: 'Bearer token',
      'Content-Type': 'application/json',
    },
    options: {
      method: 'POST',
      data: {
        pageSize: 20,
      },
      timeout: 8000,
      enableHttp2: true,
    },
  });

  assert.equal(options.url, 'https://coffee-atlas-web-web.vercel.app/api/v1/beans');
  assert.deepEqual(options.header, {
    Authorization: 'Bearer token',
    'Content-Type': 'application/json',
  });
  assert.equal(options.method, 'POST');
  assert.deepEqual(options.data, {
    pageSize: 20,
  });
  assert.equal(options.timeout, 8000);
  assert.equal(options.enableHttp2, false);
});
