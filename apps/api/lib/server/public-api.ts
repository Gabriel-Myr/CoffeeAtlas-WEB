import type {
  PaginatedResult,
  RoasterFeature,
  RoasterDetail,
  RoasterSummary,
} from '@coffee-atlas/shared-types';
import type { Roaster } from '@/lib/catalog';

import { getCatalogBeansPage, getRoasterById, getRoasterPage } from '@/lib/catalog';

import { normalizeString, sanitizeSearchTerm } from './api-helpers';
import { mapBeanCard } from './public-beans.ts';

export { getBeanDetailV1, listBeansV1 } from './public-beans.ts';
export { getBeanDiscoverV1 } from './public-bean-discover.ts';

function mapRoasterSummary(roaster: Roaster): RoasterSummary {
  return {
    id: roaster.id,
    name: roaster.name,
    city: roaster.city,
    beanCount: roaster.beanCount,
    description: roaster.description,
    logoUrl: roaster.logoUrl,
    coverImageUrl: roaster.coverImageUrl,
    taobaoUrl: roaster.taobaoUrl,
    xiaohongshuUrl: roaster.xiaohongshuUrl,
  };
}

function mapRoasterDetail(roaster: Roaster): Omit<RoasterDetail, 'beans'> {
  return {
    id: roaster.id,
    name: roaster.name,
    city: roaster.city,
    beanCount: roaster.beanCount,
    description: roaster.description,
    logoUrl: roaster.logoUrl,
    websiteUrl: roaster.websiteUrl,
    instagramHandle: roaster.instagramHandle,
    coverImageUrl: roaster.coverImageUrl,
    taobaoUrl: roaster.taobaoUrl,
    xiaohongshuUrl: roaster.xiaohongshuUrl,
  };
}

export async function listRoastersV1({
  page,
  pageSize,
  q,
  city,
  feature,
}: {
  page: number;
  pageSize: number;
  q?: string;
  city?: string;
  feature?: RoasterFeature;
}): Promise<PaginatedResult<RoasterSummary>> {
  const normalizedQ = sanitizeSearchTerm(normalizeString(q));
  const normalizedCity = normalizeString(city);
  const offset = (page - 1) * pageSize;

  const { items: roasters, total } = await getRoasterPage({
    limit: pageSize,
    offset,
    q: normalizedQ,
    city: normalizedCity,
    feature,
  });

  return {
    items: roasters.map(mapRoasterSummary),
    pageInfo: {
      page,
      pageSize,
      total,
      hasNextPage: offset + roasters.length < total,
    },
  };
}

export async function getRoasterDetailV1(id: string): Promise<RoasterDetail | null> {
  const roaster = await getRoasterById(id);
  if (!roaster) return null;

  const beanCount = roaster.beanCount > 0 ? roaster.beanCount : 1;
  const beans = await getCatalogBeansPage({
    limit: Math.max(beanCount, 1),
    offset: 0,
    roasterId: id,
  });

  return {
    ...mapRoasterDetail(roaster),
    beans: beans.map(mapBeanCard),
  };
}
