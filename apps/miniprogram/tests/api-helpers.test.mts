import assert from 'node:assert/strict';
import test from 'node:test';

import { collectPaginatedItems } from '../src/services/api-helpers.ts';

test('collectPaginatedItems loads every page until hasNextPage is false', async () => {
  const visitedPages = [];

  const items = await collectPaginatedItems(async (page) => {
    visitedPages.push(page);

    if (page === 1) {
      return {
        items: ['bean-1', 'bean-2'],
        pageInfo: {
          page,
          pageSize: 2,
          total: 5,
          hasNextPage: true,
        },
      };
    }

    if (page === 2) {
      return {
        items: ['bean-3', 'bean-4'],
        pageInfo: {
          page,
          pageSize: 2,
          total: 5,
          hasNextPage: true,
        },
      };
    }

    return {
      items: ['bean-5'],
      pageInfo: {
        page,
        pageSize: 2,
        total: 5,
        hasNextPage: false,
      },
    };
  });

  assert.deepEqual(visitedPages, [1, 2, 3]);
  assert.deepEqual(items, ['bean-1', 'bean-2', 'bean-3', 'bean-4', 'bean-5']);
});

test('collectPaginatedItems returns first page items when there is no next page', async () => {
  const visitedPages = [];

  const items = await collectPaginatedItems(async (page) => {
    visitedPages.push(page);

    return {
      items: ['bean-1'],
      pageInfo: {
        page,
        pageSize: 20,
        total: 1,
        hasNextPage: false,
      },
    };
  });

  assert.deepEqual(visitedPages, [1]);
  assert.deepEqual(items, ['bean-1']);
});
