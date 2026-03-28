import type { RoastersQuery } from './catalog-types.ts';

export type RoasterQueryPlan = {
  mode: 'paged' | 'collection';
  limit?: number;
  offset: number;
};

export function resolveRoasterQueryPlan(
  options: Pick<RoastersQuery, 'feature' | 'limit' | 'offset'> = {}
): RoasterQueryPlan {
  return {
    mode: !options.feature && typeof options.limit === 'number' ? 'paged' : 'collection',
    limit: options.limit,
    offset: options.offset ?? 0,
  };
}
