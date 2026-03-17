import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type {
  ExistingRoasterBeanRecord,
  ParsedBeanCandidate,
  TaobaoBinding,
  TaobaoBindingSeedInput,
  TaobaoImportJobStatus,
  TaobaoImportJobType,
  TaobaoPersistRowResult,
  TaobaoPublishStatus,
  TaobaoStructuredProduct,
  TaobaoSyncOutputRow,
} from './types.ts';
import { normalizeComparisonText } from './parsers.ts';

type SourceRow = {
  id: string;
  source_name: string;
  source_url: string | null;
};

type RoasterRow = {
  id: string;
  name: string;
  name_en: string | null;
};

type BeanRow = {
  id: string;
  canonical_name: string;
  origin_country: string | null;
  origin_region: string | null;
  process_method: string | null;
  variety: string | null;
};

type BeanAliasRow = {
  bean_id: string;
  alias: string;
};

type RoasterBeanRow = {
  id: string;
  roaster_id?: string;
  source_id?: string | null;
  bean_id: string;
  display_name: string;
  price_amount: number | string | null;
  product_url: string | null;
  image_url: string | null;
  source_item_id: string | null;
  source_sku_id: string | null;
  status: TaobaoPublishStatus;
};

type BindingRow = {
  id: string;
  roaster_id: string;
  source_id: string;
  canonical_shop_url: string;
  canonical_shop_name: string;
  search_keyword: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  roasters: { name: string } | Array<{ name: string }> | null;
  sources: { source_name: string } | Array<{ source_name: string }> | null;
};

function normalizeName(value: string) {
  return normalizeComparisonText(value);
}

function scoreBindingNameMatch(binding: TaobaoBinding, query: string) {
  const normalizedQuery = normalizeName(query);
  if (!normalizedQuery) return 0;

  const candidates = [
    binding.roasterName,
    binding.canonicalShopName,
    binding.searchKeyword ?? '',
  ]
    .map((value) => normalizeName(value))
    .filter(Boolean);

  let bestScore = 0;
  for (const candidate of candidates) {
    if (candidate === normalizedQuery) {
      bestScore = Math.max(bestScore, 100);
      continue;
    }
    if (candidate.startsWith(normalizedQuery)) {
      bestScore = Math.max(bestScore, 80);
      continue;
    }
    if (candidate.includes(normalizedQuery)) {
      bestScore = Math.max(bestScore, 60);
      continue;
    }
    if (normalizedQuery.includes(candidate)) {
      bestScore = Math.max(bestScore, 40);
    }
  }

  return bestScore;
}

export function selectBindingByRoasterName(bindings: TaobaoBinding[], roasterName: string) {
  const ranked = bindings
    .map((binding) => ({ binding, score: scoreBindingNameMatch(binding, roasterName) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  if (ranked.length === 0) return null;
  if (ranked.length === 1) return ranked[0]!.binding;

  const [best, second] = ranked;
  if (!best || !second) return best?.binding ?? null;
  if (best.score === second.score) return null;
  return best.binding;
}

function toNullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function takeRelationValue<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function requireSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  return { url, key };
}

export class TaobaoSyncRepository {
  private readonly db: SupabaseClient;

  constructor() {
    const { url, key } = requireSupabaseEnv();
    this.db = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async listActiveBindings() {
    const { data, error } = await this.db
      .from('roaster_source_bindings')
      .select(
        'id, roaster_id, source_id, canonical_shop_url, canonical_shop_name, search_keyword, is_active, last_synced_at, roasters!inner(name), sources!inner(source_name)'
      )
      .eq('is_active', true)
      .order('last_synced_at', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return ((data ?? []) as BindingRow[]).map((row) => {
      const roaster = takeRelationValue(row.roasters);
      const source = takeRelationValue(row.sources);
      return {
        id: row.id,
        roasterId: row.roaster_id,
        roasterName: roaster?.name ?? '',
        sourceId: row.source_id,
        sourceName: source?.source_name ?? '',
        canonicalShopUrl: row.canonical_shop_url,
        canonicalShopName: row.canonical_shop_name,
        searchKeyword: row.search_keyword,
        isActive: row.is_active,
        lastSyncedAt: row.last_synced_at,
      } satisfies TaobaoBinding;
    });
  }

  async findBindingById(bindingId: string) {
    const { data, error } = await this.db
      .from('roaster_source_bindings')
      .select(
        'id, roaster_id, source_id, canonical_shop_url, canonical_shop_name, search_keyword, is_active, last_synced_at, roasters!inner(name), sources!inner(source_name)'
      )
      .eq('id', bindingId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const row = data as BindingRow;
    const roaster = takeRelationValue(row.roasters);
    const source = takeRelationValue(row.sources);

    return {
      id: row.id,
      roasterId: row.roaster_id,
      roasterName: roaster?.name ?? '',
      sourceId: row.source_id,
      sourceName: source?.source_name ?? '',
      canonicalShopUrl: row.canonical_shop_url,
      canonicalShopName: row.canonical_shop_name,
      searchKeyword: row.search_keyword,
      isActive: row.is_active,
      lastSyncedAt: row.last_synced_at,
    } satisfies TaobaoBinding;
  }

  async findBindingByRoasterName(roasterName: string) {
    const bindings = await this.listActiveBindings();
    return selectBindingByRoasterName(bindings, roasterName);
  }

  async findRoasterByName(name: string) {
    const { data, error } = await this.db
      .from('roasters')
      .select('id, name, name_en')
      .or(`name.ilike.${name},name_en.ilike.${name}`)
      .limit(20);

    if (error) throw error;

    const normalized = normalizeName(name);
    return ((data ?? []) as RoasterRow[]).find((row) => {
      return normalizeName(row.name) === normalized || normalizeName(row.name_en ?? '') === normalized;
    }) ?? null;
  }

  async ensureEcommerceSource(args: { sourceName: string; sourceUrl?: string | null; ownerLabel?: string | null }) {
    const sourceUrl = args.sourceUrl?.trim() || null;
    if (sourceUrl) {
      const byUrl = await this.db
        .from('sources')
        .select('id, source_name, source_url')
        .eq('source_type', 'ECOMMERCE')
        .eq('source_url', sourceUrl)
        .maybeSingle();
      if (byUrl.error) throw byUrl.error;
      if (byUrl.data) {
        return byUrl.data as SourceRow;
      }
    }

    const existing = await this.db
      .from('sources')
      .select('id, source_name, source_url')
      .eq('source_type', 'ECOMMERCE')
      .ilike('source_name', args.sourceName)
      .limit(20);
    if (existing.error) throw existing.error;

    const normalized = normalizeName(args.sourceName);
    const matched = ((existing.data ?? []) as SourceRow[]).find((row) => normalizeName(row.source_name) === normalized) ?? null;
    if (matched) {
      if (sourceUrl && matched.source_url !== sourceUrl) {
        const { data, error } = await this.db
          .from('sources')
          .update({ source_url: sourceUrl, owner_label: args.ownerLabel ?? null, is_active: true })
          .eq('id', matched.id)
          .select('id, source_name, source_url')
          .single();
        if (error) throw error;
        return data as SourceRow;
      }
      return matched;
    }

    const { data, error } = await this.db
      .from('sources')
      .insert({
        source_type: 'ECOMMERCE',
        source_name: args.sourceName,
        source_url: sourceUrl,
        owner_label: args.ownerLabel ?? null,
        is_active: true,
      })
      .select('id, source_name, source_url')
      .single();

    if (error) throw error;
    return data as SourceRow;
  }

  async upsertBindingFromSeed(seed: TaobaoBindingSeedInput) {
    const roaster = await this.findRoasterByName(seed.roasterName);
    if (!roaster) {
      throw new Error(`Roaster not found for binding seed: ${seed.roasterName}`);
    }

    const source = await this.ensureEcommerceSource({
      sourceName: seed.canonicalShopName,
      sourceUrl: seed.canonicalShopUrl ?? null,
      ownerLabel: roaster.name,
    });

    const existing = await this.db
      .from('roaster_source_bindings')
      .select('id')
      .eq('roaster_id', roaster.id)
      .eq('source_id', source.id)
      .maybeSingle();
    if (existing.error) throw existing.error;

    const canonicalShopUrl = seed.canonicalShopUrl ?? source.source_url ?? null;
    if (!canonicalShopUrl) {
      throw new Error(`Missing canonical shop url for binding seed: ${seed.roasterName} / ${seed.canonicalShopName}`);
    }

    const payload = {
      roaster_id: roaster.id,
      source_id: source.id,
      canonical_shop_url: canonicalShopUrl,
      canonical_shop_name: seed.canonicalShopName,
      search_keyword: seed.searchKeyword ?? null,
      is_active: seed.isActive ?? true,
    };

    if (existing.data) {
      const { data, error } = await this.db
        .from('roaster_source_bindings')
        .update(payload)
        .eq('id', existing.data.id)
        .select('id')
        .single();
      if (error) throw error;
      return { action: 'updated' as const, bindingId: data.id, sourceId: source.id, roasterId: roaster.id };
    }

    const { data, error } = await this.db
      .from('roaster_source_bindings')
      .insert(payload)
      .select('id')
      .single();
    if (error) throw error;

    return { action: 'inserted' as const, bindingId: data.id, sourceId: source.id, roasterId: roaster.id };
  }

  async createImportJob(args: {
    sourceId?: string | null;
    fileName?: string | null;
    summary?: Record<string, unknown>;
    jobType?: TaobaoImportJobType;
  }) {
    const { data, error } = await this.db
      .from('import_jobs')
      .insert({
        job_type: args.jobType ?? 'SCRAPE_SYNC',
        status: 'RUNNING',
        source_id: args.sourceId ?? null,
        file_name: args.fileName ?? null,
        summary: args.summary ?? {},
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id as string;
  }

  async finishImportJob(args: {
    importJobId: string;
    status: TaobaoImportJobStatus;
    rowCount: number;
    errorCount: number;
    summary: Record<string, unknown>;
  }) {
    const { error } = await this.db
      .from('import_jobs')
      .update({
        status: args.status,
        row_count: args.rowCount,
        error_count: args.errorCount,
        summary: args.summary,
        completed_at: new Date().toISOString(),
      })
      .eq('id', args.importJobId);

    if (error) throw error;
  }

  async recordEvent(args: {
    importJobId: string;
    sourceId?: string | null;
    entityType: 'ROASTER' | 'BEAN' | 'ROASTER_BEAN' | 'ALIAS';
    entityId?: string | null;
    action: 'INSERT' | 'UPDATE' | 'UPSERT' | 'SKIP' | 'ERROR';
    payload: Record<string, unknown>;
    errorMessage?: string | null;
  }) {
    const { error } = await this.db.from('ingestion_events').insert({
      import_job_id: args.importJobId,
      source_id: args.sourceId ?? null,
      entity_type: args.entityType,
      entity_id: args.entityId ?? null,
      action: args.action,
      payload: args.payload,
      error_message: args.errorMessage ?? null,
    });

    if (error) throw error;
  }

  async findExistingRoasterBeanBySourceIdentity(sourceId: string, sourceItemId: string, sourceSkuId: string | null) {
    const { data, error } = await this.db
      .from('roaster_beans')
      .select('id, bean_id, display_name, price_amount, product_url, image_url, source_item_id, source_sku_id, status')
      .eq('source_id', sourceId)
      .eq('source_item_id', sourceItemId)
      .eq('source_sku_id', sourceSkuId ?? '')
      .maybeSingle();

    if (error) {
      const fallback = await this.db
        .from('roaster_beans')
        .select('id, bean_id, display_name, price_amount, product_url, image_url, source_item_id, source_sku_id, status')
        .eq('source_id', sourceId)
        .eq('source_item_id', sourceItemId)
        .is('source_sku_id', null)
        .maybeSingle();
      if (fallback.error) throw fallback.error;
      return fallback.data ? this.mapRoasterBeanRecord(fallback.data as RoasterBeanRow) : null;
    }

    return data ? this.mapRoasterBeanRecord(data as RoasterBeanRow) : null;
  }

  async findRoasterBeanByDisplayName(roasterId: string, displayName: string) {
    const { data, error } = await this.db
      .from('roaster_beans')
      .select('id, bean_id, display_name, price_amount, product_url, image_url, source_item_id, source_sku_id, status')
      .eq('roaster_id', roasterId)
      .ilike('display_name', displayName)
      .limit(20);

    if (error) throw error;
    const normalized = normalizeName(displayName);
    const matched = ((data ?? []) as RoasterBeanRow[]).find((row) => normalizeName(row.display_name) === normalized) ?? null;
    return matched ? this.mapRoasterBeanRecord(matched) : null;
  }

  async listTrackedRoasterBeansForBinding(binding: TaobaoBinding) {
    const { data, error } = await this.db
      .from('roaster_beans')
      .select('id, roaster_id, source_id, bean_id, display_name, price_amount, product_url, image_url, source_item_id, source_sku_id, status')
      .eq('source_id', binding.sourceId)
      .in('status', ['ACTIVE', 'DRAFT'])
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const { data: legacyData, error: legacyError } = await this.db
      .from('roaster_beans')
      .select('id, roaster_id, source_id, bean_id, display_name, price_amount, product_url, image_url, source_item_id, source_sku_id, status')
      .eq('roaster_id', binding.roasterId)
      .is('source_id', null)
      .in('status', ['ACTIVE', 'DRAFT'])
      .order('updated_at', { ascending: false });

    if (legacyError) throw legacyError;

    const merged = new Map<string, ExistingRoasterBeanRecord>();
    for (const row of ((data ?? []) as RoasterBeanRow[]).map((item) => this.mapRoasterBeanRecord(item))) {
      merged.set(row.id, row);
    }
    for (const row of ((legacyData ?? []) as RoasterBeanRow[]).map((item) => this.mapRoasterBeanRecord(item))) {
      merged.set(row.id, row);
    }

    return [...merged.values()];
  }

  private mapRoasterBeanRecord(row: RoasterBeanRow): ExistingRoasterBeanRecord {
    return {
      id: row.id,
      beanId: row.bean_id,
      displayName: row.display_name,
      priceAmount: toNullableNumber(row.price_amount),
      productUrl: row.product_url,
      imageUrl: row.image_url,
      sourceItemId: row.source_item_id,
      sourceSkuId: row.source_sku_id,
      status: row.status,
    };
  }

  async findBeanByCanonicalNameOrAlias(name: string) {
    const canonical = await this.db.from('beans').select('id, canonical_name, origin_country, origin_region, process_method, variety').ilike('canonical_name', name).limit(20);
    if (canonical.error) throw canonical.error;

    const normalized = normalizeName(name);
    const canonicalMatch = ((canonical.data ?? []) as BeanRow[]).find((row) => normalizeName(row.canonical_name) === normalized) ?? null;
    if (canonicalMatch) {
      return { bean: canonicalMatch, matchedBy: 'canonical' as const };
    }

    const aliases = await this.db.from('bean_aliases').select('bean_id, alias').ilike('alias', name).limit(20);
    if (aliases.error) throw aliases.error;

    const aliasMatch = ((aliases.data ?? []) as BeanAliasRow[]).find((row) => normalizeName(row.alias) === normalized) ?? null;
    if (!aliasMatch) return null;

    const bean = await this.db
      .from('beans')
      .select('id, canonical_name, origin_country, origin_region, process_method, variety')
      .eq('id', aliasMatch.bean_id)
      .maybeSingle();
    if (bean.error) throw bean.error;
    if (!bean.data) return null;

    return { bean: bean.data as BeanRow, matchedBy: 'alias' as const };
  }

  async findOrCreateBean(candidate: ParsedBeanCandidate) {
    const existing = await this.findBeanByCanonicalNameOrAlias(candidate.beanName);
    if (existing) {
      return { bean: existing.bean, created: false, matchedBy: existing.matchedBy };
    }

    const { data, error } = await this.db
      .from('beans')
      .insert({
        canonical_name: candidate.beanName,
        origin_country: candidate.originCountry,
        origin_region: candidate.originRegion,
        process_method: candidate.processMethod,
        variety: candidate.variety,
        is_public: true,
      })
      .select('id, canonical_name, origin_country, origin_region, process_method, variety')
      .single();

    if (error) throw error;
    return { bean: data as BeanRow, created: true, matchedBy: 'created' as const };
  }

  async upsertBeanAlias(args: { beanId: string; alias: string; sourceId?: string | null; confidence: number }) {
    const alias = args.alias.trim();
    if (!alias) return null;

    const existing = await this.db
      .from('bean_aliases')
      .select('id')
      .eq('bean_id', args.beanId)
      .eq('alias', alias)
      .eq('alias_lang', 'zh-CN')
      .maybeSingle();
    if (existing.error) throw existing.error;

    if (existing.data) {
      const { data, error } = await this.db
        .from('bean_aliases')
        .update({
          source_id: args.sourceId ?? null,
          confidence: args.confidence,
        })
        .eq('id', existing.data.id)
        .select('id')
        .single();
      if (error) throw error;
      return { action: 'updated' as const, aliasId: data.id };
    }

    const { data, error } = await this.db
      .from('bean_aliases')
      .insert({
        bean_id: args.beanId,
        alias,
        alias_lang: 'zh-CN',
        source_id: args.sourceId ?? null,
        confidence: args.confidence,
      })
      .select('id')
      .single();
    if (error) throw error;
    return { action: 'inserted' as const, aliasId: data.id };
  }

  async persistRoasterBean(args: {
    binding: TaobaoBinding;
    product: TaobaoStructuredProduct;
    candidate: ParsedBeanCandidate;
    beanId: string;
    status: TaobaoPublishStatus;
    existing: ExistingRoasterBeanRecord | null;
  }): Promise<TaobaoPersistRowResult> {
    const payload = {
      roaster_id: args.binding.roasterId,
      bean_id: args.beanId,
      source_id: args.binding.sourceId,
      display_name: args.product.title,
      roast_level: args.candidate.roastLevel,
      price_amount: args.product.priceAmount,
      price_currency: 'CNY',
      weight_grams: args.candidate.weightGrams,
      product_url: args.product.productUrl,
      image_url: args.product.imageUrl,
      source_item_id: args.product.sourceItemId,
      source_sku_id: args.product.sourceSkuId,
      status: args.status,
      is_in_stock: true,
    };

    const output: TaobaoSyncOutputRow = {
      roasterId: args.binding.roasterId,
      sourceId: args.binding.sourceId,
      sourceItemId: args.product.sourceItemId,
      sourceSkuId: args.product.sourceSkuId,
      displayName: args.product.title,
      beanName: args.candidate.beanName,
      productUrl: args.product.productUrl,
      imageUrl: args.product.imageUrl,
      priceAmount: args.product.priceAmount,
      shopName: args.product.shopName,
      parseSource: args.candidate.parseSource,
      parseWarnings: args.candidate.parseWarnings,
    };

    if (args.existing) {
      const { data, error } = await this.db
        .from('roaster_beans')
        .update(payload)
        .eq('id', args.existing.id)
        .select('id')
        .single();
      if (error) throw error;
      return {
        action: 'updated',
        beanId: args.beanId,
        roasterBeanId: data.id,
        status: args.status,
        output,
      };
    }

    const { data, error } = await this.db
      .from('roaster_beans')
      .insert(payload)
      .select('id')
      .single();
    if (error) throw error;

    return {
      action: 'inserted',
      beanId: args.beanId,
      roasterBeanId: data.id,
      status: args.status,
      output,
    };
  }

  async touchBinding(bindingId: string) {
    const { error } = await this.db
      .from('roaster_source_bindings')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', bindingId);

    if (error) throw error;
  }

  async archiveRoasterBeans(args: { roasterBeanIds: string[]; retiredAt: string }) {
    if (args.roasterBeanIds.length === 0) return [] as Array<{ id: string }>;

    const { data, error } = await this.db
      .from('roaster_beans')
      .update({
        status: 'ARCHIVED',
        is_in_stock: false,
        retire_at: args.retiredAt,
      })
      .in('id', args.roasterBeanIds)
      .select('id');

    if (error) throw error;
    return (data ?? []) as Array<{ id: string }>;
  }
}
