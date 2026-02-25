import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { CatalogStatusFilter, PublishStatus } from '@/lib/types';

const ALLOWED_STATUS: CatalogStatusFilter[] = ['ALL', 'ACTIVE', 'DRAFT', 'ARCHIVED'];

function parseLimit(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(parsed)) return 100;
  return Math.min(Math.max(parsed, 1), 300);
}

function parseOffset(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(parsed, 0);
}

function parseStatus(raw: string | null): CatalogStatusFilter {
  if (!raw) return 'ALL';
  if (ALLOWED_STATUS.includes(raw as CatalogStatusFilter)) {
    return raw as CatalogStatusFilter;
  }
  return 'ALL';
}

function toCatalogRow(item: Record<string, unknown>) {
  return {
    roasterBeanId: String(item.roaster_bean_id ?? ''),
    roasterName: String(item.roaster_name ?? ''),
    city: item.city ? String(item.city) : null,
    beanName: String(item.bean_name ?? ''),
    displayName: String(item.display_name ?? ''),
    processMethod: item.process_method ? String(item.process_method) : null,
    roastLevel: item.roast_level ? String(item.roast_level) : null,
    priceAmount: typeof item.price_amount === 'number' ? item.price_amount : null,
    priceCurrency: String(item.price_currency ?? 'CNY'),
    isInStock: Boolean(item.is_in_stock),
    status: (item.status as PublishStatus) ?? 'DRAFT',
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim();
    const status = parseStatus(url.searchParams.get('status'));
    const limit = parseLimit(url.searchParams.get('limit'));
    const offset = parseOffset(url.searchParams.get('offset'));
    const escapedQ = q.replaceAll(',', ' ').replaceAll('%', '').replaceAll('_', '');

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('v_catalog_admin')
      .select(
        'roaster_bean_id, roaster_name, city, bean_name, display_name, process_method, roast_level, price_amount, price_currency, is_in_stock, status, updated_at',
        { count: 'exact' }
      )
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== 'ALL') {
      query = query.eq('status', status);
    }

    if (escapedQ) {
      query = query.or(
        `roaster_name.ilike.%${escapedQ}%,bean_name.ilike.%${escapedQ}%,display_name.ilike.%${escapedQ}%`
      );
    }

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json(
        { ok: false, error: `Catalog query failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: (data ?? []).map((item) => toCatalogRow(item as Record<string, unknown>)),
      total: count ?? 0,
      limit,
      offset,
      q,
      status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown server error',
      },
      { status: 500 }
    );
  }
}
