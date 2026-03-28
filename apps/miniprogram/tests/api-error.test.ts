import assert from 'node:assert/strict';
import test from 'node:test';

import { formatApiRequestErrorMessage } from '../src/utils/api-error.ts';

test('formatApiRequestErrorMessage keeps normal error messages', () => {
  const message = formatApiRequestErrorMessage(new Error('服务端返回 500'), {
    baseUrl: 'https://coffeeatlas-api.example.com',
  });

  assert.equal(message, '服务端返回 500');
});

test('formatApiRequestErrorMessage explains timeout errors with health-check hint', () => {
  const message = formatApiRequestErrorMessage(
    new Error('[] timeout(env: macOS,mp,2.01.2510280; lib: 3.15.0)'),
    {
      baseUrl: 'https://coffeeatlas-api.example.com',
    }
  );

  assert.equal(
    message,
    '请求超时：小程序没能在 15 秒内连上 API。请先到“我的 > API 联调”确认当前地址可访问，再在浏览器或接口工具打开 https://coffeeatlas-api.example.com/api/v1/health 检查服务是否正常。'
  );
});

test('formatApiRequestErrorMessage falls back when timeout happens without baseUrl', () => {
  const message = formatApiRequestErrorMessage(new Error('request:fail timeout'), {
    baseUrl: '',
  });

  assert.equal(
    message,
    '请求超时：小程序没能在 15 秒内连上 API。请先到“我的 > API 联调”确认地址是否填写正确，然后重试。'
  );
});
