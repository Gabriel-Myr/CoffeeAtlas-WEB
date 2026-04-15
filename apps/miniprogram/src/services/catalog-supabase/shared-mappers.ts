import type { CoffeeBean, RoasterDetail, RoasterSummary } from '../../types/index.ts';
import {
  isProcessBaseId,
  isProcessStyleId,
  normalizeProcess,
} from '@coffee-atlas/shared-types';
import type { ActiveCatalogRow, RoasterAggregate, RoasterRow } from './shared-core.ts';
import {
  isRecentUpdatedAt,
  normalizeOptionalString,
  normalizeSalesCount,
  normalizeString,
  toNumber,
} from './shared-core.ts';

export function mapCatalogBeanRow(row: ActiveCatalogRow, latestNewArrivalIds?: Set<string>): CoffeeBean {
  const rowId = normalizeString(row.roaster_bean_id);
  const normalizedProcess = normalizeProcess(row.process_method, {
    base: isProcessBaseId(row.process_base) ? row.process_base : undefined,
    style: isProcessStyleId(row.process_style) ? row.process_style : undefined,
  });

  return {
    id: rowId,
    name: normalizeString(row.display_name),
    roasterId: normalizeString(row.roaster_id),
    roasterName: normalizeString(row.roaster_name),
    city: normalizeString(row.city),
    originCountry: normalizeString(row.origin_country),
    originRegion: normalizeString(row.origin_region),
    farm: normalizeString(row.farm),
    variety: normalizeString(row.variety),
    process: normalizedProcess.label,
    processBase: normalizedProcess.base,
    processStyle: normalizedProcess.style,
    processRaw: normalizedProcess.raw,
    roastLevel: normalizeString(row.roast_level),
    price: toNumber(row.price_amount),
    discountedPrice: toNumber(row.price_amount),
    currency: normalizeString(row.price_currency) || 'CNY',
    salesCount: normalizeSalesCount(row.sales_count),
    tastingNotes: [],
    imageUrl: normalizeOptionalString(row.image_url),
    productUrl: normalizeOptionalString(row.product_url),
    isInStock: row.is_in_stock ?? true,
    isNewArrival: latestNewArrivalIds?.has(rowId) ?? isRecentUpdatedAt(row.updated_at),
  };
}

export function mapRoasterSummary(row: RoasterRow, aggregate: RoasterAggregate): RoasterSummary {
  const logoUrl = normalizeOptionalString(row.logo_url);

  return {
    id: row.id,
    name: normalizeString(row.name),
    city: normalizeString(row.city),
    beanCount: aggregate.beanCount,
    description: normalizeOptionalString(row.description),
    logoUrl,
    coverImageUrl: aggregate.coverImageUrl ?? logoUrl,
    taobaoUrl: aggregate.taobaoUrl,
    xiaohongshuUrl: aggregate.xiaohongshuUrl,
  };
}

export function mapRoasterDetail(
  row: RoasterRow,
  aggregate: RoasterAggregate,
  beans: CoffeeBean[]
): RoasterDetail {
  const summary = mapRoasterSummary(row, aggregate);

  return {
    ...summary,
    websiteUrl: normalizeOptionalString(row.website_url),
    instagramHandle: normalizeOptionalString(row.instagram_handle),
    beans,
  };
}
