import type { CatalogClient, RoasterAggregate, RoasterBeanAggregateRow } from './shared-core.ts';
import type { RoasterFeature, RoasterSummary } from '../../types/index.ts';
import { normalizeOptionalString } from './shared-core.ts';

function isTaobaoUrl(url: string): boolean {
  const normalized = url.toLowerCase();
  return normalized.includes('taobao.com') || normalized.includes('tmall.com');
}

function isXiaohongshuUrl(url: string): boolean {
  const normalized = url.toLowerCase();
  return normalized.includes('xiaohongshu.com') || normalized.includes('xhslink.com');
}

export function createEmptyRoasterAggregate(): RoasterAggregate {
  return {
    beanCount: 0,
    coverImageUrl: null,
    taobaoUrl: null,
    xiaohongshuUrl: null,
  };
}

export function matchesRoasterFeature(
  roaster: RoasterSummary,
  feature?: RoasterFeature
): boolean {
  switch (feature) {
    case 'has_image':
      return Boolean(roaster.coverImageUrl || roaster.logoUrl);
    case 'has_beans':
      return (roaster.beanCount ?? 0) > 0;
    case 'taobao':
      return Boolean(roaster.taobaoUrl);
    case 'xiaohongshu':
      return Boolean(roaster.xiaohongshuUrl);
    default:
      return true;
  }
}

export async function fetchRoasterAggregates(client: CatalogClient, roasterIds: string[]) {
  if (roasterIds.length === 0) return new Map<string, RoasterAggregate>();

  const { data, error } = await client
    .from('roaster_beans')
    .select('roaster_id, image_url, product_url')
    .eq('status', 'ACTIVE')
    .in('roaster_id', roasterIds)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`加载烘焙商聚合数据失败：${error.message}`);
  }

  const aggregates = new Map<string, RoasterAggregate>();

  for (const item of (data ?? []) as RoasterBeanAggregateRow[]) {
    const roasterId = normalizeOptionalString(item.roaster_id);
    if (!roasterId) continue;

    const aggregate = aggregates.get(roasterId) ?? createEmptyRoasterAggregate();
    aggregate.beanCount += 1;

    const imageUrl = normalizeOptionalString(item.image_url);
    if (imageUrl && !aggregate.coverImageUrl) {
      aggregate.coverImageUrl = imageUrl;
    }

    const productUrl = normalizeOptionalString(item.product_url);
    if (productUrl && !aggregate.taobaoUrl && isTaobaoUrl(productUrl)) {
      aggregate.taobaoUrl = productUrl;
    }
    if (productUrl && !aggregate.xiaohongshuUrl && isXiaohongshuUrl(productUrl)) {
      aggregate.xiaohongshuUrl = productUrl;
    }

    aggregates.set(roasterId, aggregate);
  }

  return aggregates;
}
