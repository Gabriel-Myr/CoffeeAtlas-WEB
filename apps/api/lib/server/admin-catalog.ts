import type { PublishStatus } from '@/lib/types';

import { requireSupabaseServer } from '@/lib/supabase';

import {
  badRequest,
  conflict,
  normalizeCountryCode,
  normalizeName,
  normalizeString,
  parseJsonNumber,
  parseStringArray,
  sanitizeSearchTerm,
} from './api-helpers';

type AdminRoasterRow = {
  id: string;
  name: string;
  city: string | null;
  country_code: string | null;
};

type AdminBeanRow = {
  id: string;
  canonical_name: string;
};

type AdminRoasterBeanRow = {
  id: string;
  roaster_id: string;
  bean_id: string;
  display_name: string;
};

type CreateAdminBeanInput = {
  roasterId?: unknown;
  roasterName?: unknown;
  city?: unknown;
  countryCode?: unknown;
  beanName?: unknown;
  originCountry?: unknown;
  originRegion?: unknown;
  processMethod?: unknown;
  variety?: unknown;
  displayName?: unknown;
  roastLevel?: unknown;
  priceAmount?: unknown;
  priceCurrency?: unknown;
  productUrl?: unknown;
  flavorTags?: unknown;
  isInStock?: unknown;
  status?: unknown;
};

const VALID_STATUSES: PublishStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

function normalizeCurrency(value: unknown): string {
  const normalized = normalizeString(typeof value === 'string' ? value : undefined) ?? 'CNY';
  if (!/^[A-Za-z]{3}$/.test(normalized)) {
    badRequest('priceCurrency must be a 3-letter currency code', 'invalid_currency');
  }
  return normalized.toUpperCase();
}

function validateStatus(value: unknown): PublishStatus {
  if (typeof value !== 'string' || !VALID_STATUSES.includes(value as PublishStatus)) {
    badRequest('status must be one of DRAFT, ACTIVE, ARCHIVED', 'invalid_status');
  }
  return value as PublishStatus;
}

function validateBoolean(value: unknown, field: string, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') badRequest(`${field} must be a boolean`, 'invalid_payload');
  return value;
}

function wildcardQuery(value: string) {
  return `%${value}%`;
}

async function findRoasterById(id: string) {
  const supabaseServer = requireSupabaseServer();
  const { data, error } = await supabaseServer
    .from('roasters')
    .select('id, name, city, country_code')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as AdminRoasterRow | null;
}

async function findExistingRoasterByName(name: string) {
  const supabaseServer = requireSupabaseServer();
  const exactName = normalizeString(name);
  if (!exactName) return null;

  const exactMatch = await supabaseServer
    .from('roasters')
    .select('id, name, city, country_code')
    .ilike('name', exactName)
    .limit(10);
  if (exactMatch.error) throw exactMatch.error;

  const normalized = normalizeName(exactName);
  const byPrimaryName =
    ((exactMatch.data ?? []) as AdminRoasterRow[]).find((row) => normalizeName(row.name) === normalized) ?? null;
  if (byPrimaryName) return byPrimaryName;

  const englishMatch = await supabaseServer
    .from('roasters')
    .select('id, name, city, country_code')
    .ilike('name_en', exactName)
    .limit(10);
  if (englishMatch.error) throw englishMatch.error;

  return ((englishMatch.data ?? []) as AdminRoasterRow[]).find((row) => normalizeName(row.name) === normalized) ?? null;
}

async function findExistingBeanByName(name: string) {
  const supabaseServer = requireSupabaseServer();
  const exactName = normalizeString(name);
  if (!exactName) return null;

  const { data, error } = await supabaseServer
    .from('beans')
    .select('id, canonical_name')
    .ilike('canonical_name', exactName)
    .limit(10);

  if (error) throw error;

  const normalized = normalizeName(exactName);
  return ((data ?? []) as AdminBeanRow[]).find((row) => normalizeName(row.canonical_name) === normalized) ?? null;
}

async function findExistingRoasterBean(roasterId: string, beanId: string, displayName: string) {
  const supabaseServer = requireSupabaseServer();
  const { data, error } = await supabaseServer
    .from('roaster_beans')
    .select('id, roaster_id, bean_id, display_name')
    .eq('roaster_id', roasterId)
    .eq('bean_id', beanId)
    .ilike('display_name', displayName)
    .limit(10);

  if (error) throw error;

  const normalized = normalizeName(displayName);
  return ((data ?? []) as AdminRoasterBeanRow[]).find((row) => normalizeName(row.display_name) === normalized) ?? null;
}

export async function searchAdminRoasters({
  q,
  limit,
}: {
  q?: string;
  limit: number;
}) {
  const supabaseServer = requireSupabaseServer();
  const normalizedQ = sanitizeSearchTerm(normalizeString(q));

  let query = supabaseServer
    .from('roasters')
    .select('id, name, city, country_code')
    .order('name')
    .limit(limit);

  if (normalizedQ) {
    const wildcard = wildcardQuery(normalizedQ);
    query = query.or(`name.ilike.${wildcard},name_en.ilike.${wildcard},city.ilike.${wildcard}`);
  }

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as AdminRoasterRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
    countryCode: row.country_code,
  }));
}

export async function createAdminBean(input: CreateAdminBeanInput) {
  const supabaseServer = requireSupabaseServer();

  const roasterId = normalizeString(typeof input.roasterId === 'string' ? input.roasterId : undefined);
  const roasterName = normalizeString(typeof input.roasterName === 'string' ? input.roasterName : undefined);
  const beanName = normalizeString(typeof input.beanName === 'string' ? input.beanName : undefined);
  const displayName = normalizeString(typeof input.displayName === 'string' ? input.displayName : undefined);

  if (!roasterId && !roasterName) {
    badRequest('roasterName is required when roasterId is missing', 'invalid_payload');
  }
  if (!beanName) badRequest('beanName is required', 'invalid_payload');
  if (!displayName) badRequest('displayName is required', 'invalid_payload');

  const city = normalizeString(typeof input.city === 'string' ? input.city : undefined);
  const countryCode = normalizeCountryCode(typeof input.countryCode === 'string' ? input.countryCode : undefined);
  const originCountry = normalizeString(typeof input.originCountry === 'string' ? input.originCountry : undefined);
  const originRegion = normalizeString(typeof input.originRegion === 'string' ? input.originRegion : undefined);
  const processMethod = normalizeString(typeof input.processMethod === 'string' ? input.processMethod : undefined);
  const variety = normalizeString(typeof input.variety === 'string' ? input.variety : undefined);
  const roastLevel = normalizeString(typeof input.roastLevel === 'string' ? input.roastLevel : undefined);
  const priceAmount = parseJsonNumber(input.priceAmount, 'priceAmount');
  const priceCurrency = normalizeCurrency(input.priceCurrency);
  const productUrl = normalizeString(typeof input.productUrl === 'string' ? input.productUrl : undefined);
  const flavorTags = parseStringArray(input.flavorTags, 'flavorTags');
  const isInStock = validateBoolean(input.isInStock, 'isInStock', true);
  const status = validateStatus(input.status ?? 'DRAFT');

  let roaster = roasterId ? await findRoasterById(roasterId) : null;
  if (!roaster && roasterId) {
    badRequest('roasterId does not exist', 'invalid_roaster');
  }
  if (!roaster && roasterName) {
    roaster = await findExistingRoasterByName(roasterName);
  }
  if (!roaster) {
    const { data, error } = await supabaseServer
      .from('roasters')
      .insert({
        name: roasterName!,
        city: city ?? null,
        country_code: countryCode ?? null,
        is_public: true,
      })
      .select('id, name, city, country_code')
      .single();

    if (error) throw error;
    roaster = data as AdminRoasterRow;
  }

  let bean = await findExistingBeanByName(beanName);
  if (!bean) {
    const { data, error } = await supabaseServer
      .from('beans')
      .insert({
        canonical_name: beanName,
        origin_country: originCountry ?? null,
        origin_region: originRegion ?? null,
        process_method: processMethod ?? null,
        variety: variety ?? null,
        flavor_tags: flavorTags ?? [],
        is_public: true,
      })
      .select('id, canonical_name')
      .single();

    if (error) throw error;
    bean = data as AdminBeanRow;
  }

  const existingRoasterBean = await findExistingRoasterBean(roaster.id, bean.id, displayName);
  if (existingRoasterBean) {
    conflict('A product with the same roaster, bean, and display name already exists', 'duplicate_roaster_bean');
  }

  const { data: roasterBeanData, error: roasterBeanError } = await supabaseServer
    .from('roaster_beans')
    .insert({
      roaster_id: roaster.id,
      bean_id: bean.id,
      display_name: displayName,
      roast_level: roastLevel ?? null,
      price_amount: priceAmount ?? null,
      price_currency: priceCurrency,
      product_url: productUrl ?? null,
      is_in_stock: isInStock,
      status,
    })
    .select('id, roaster_id, bean_id, display_name')
    .single();

  if (roasterBeanError) throw roasterBeanError;

  return {
    roaster: {
      id: roaster.id,
      name: roaster.name,
      city: roaster.city,
      countryCode: roaster.country_code,
    },
    bean: {
      id: bean.id,
      canonicalName: bean.canonical_name,
    },
    roasterBean: {
      id: (roasterBeanData as AdminRoasterBeanRow).id,
      displayName,
      status,
      isInStock,
    },
  };
}
