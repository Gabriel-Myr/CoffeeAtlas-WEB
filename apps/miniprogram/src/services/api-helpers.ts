import type { PaginatedResult } from '../types';

export async function collectPaginatedItems<T>(
  loadPage: (page: number) => Promise<PaginatedResult<T>>
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await loadPage(page);
    items.push(...(response.items ?? []));
    hasNextPage = response.pageInfo.hasNextPage;
    page += 1;
  }

  return items;
}
