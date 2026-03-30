import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { createClient } from '@supabase/supabase-js';

import { normalizeComparisonText, parseBeanCandidateFromSources } from '../lib/taobao-sync/parsers.ts';
import { runOcrFromImageUrl } from '../lib/taobao-sync/ocr.ts';

type BeanRelation = {
  canonical_name: string | null;
  origin_country: string | null;
  origin_region: string | null;
  process_method: string | null;
  variety: string | null;
} | null;

type AuditRow = {
  id: string;
  display_name: string;
  roast_level: string | null;
  weight_grams: number | null;
  image_url: string | null;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  source_item_id: string | null;
  source_sku_id: string | null;
  product_url: string | null;
  beans: BeanRelation | BeanRelation[];
};

type FieldKey = 'beanName' | 'originCountry' | 'originRegion' | 'processMethod' | 'variety' | 'roastLevel' | 'weightGrams';

type ComparedField = {
  field: FieldKey;
  existingValue: string | number | null;
  ocrValue: string | number | null;
  kind: 'mismatch' | 'missing_in_db' | 'missing_in_ocr';
};

type AuditEntry = {
  id: string;
  title: string;
  status: string;
  sourceItemId: string | null;
  sourceSkuId: string | null;
  productUrl: string | null;
  imageUrl: string | null;
  existing: Record<FieldKey, string | number | null>;
  ocr: {
    text: string;
    confidence: string;
    warnings: string[];
    candidate: Record<FieldKey, string | number | null>;
  };
  comparedFields: ComparedField[];
};

function parseArgs(argv: string[]) {
  const args = {
    limit: Number.POSITIVE_INFINITY,
    output: path.join('/tmp', `taobao-ocr-audit-${Date.now()}.json`),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];
    if (current === '--limit' && next) {
      const parsed = Number.parseInt(next, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.limit = parsed;
      }
      index += 1;
      continue;
    }
    if (current === '--output' && next) {
      args.output = path.resolve(next);
      index += 1;
    }
  }

  return args;
}

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function takeBeanRelation(value: BeanRelation | BeanRelation[]) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizeValue(value: string | number | null) {
  if (value === null) return '';
  if (typeof value === 'number') return String(value);
  return normalizeComparisonText(value);
}

function isSameValue(left: string | number | null, right: string | number | null) {
  return normalizeValue(left) === normalizeValue(right);
}

function pickFields(row: AuditRow) {
  const bean = takeBeanRelation(row.beans);
  return {
    beanName: bean?.canonical_name ?? null,
    originCountry: bean?.origin_country ?? null,
    originRegion: bean?.origin_region ?? null,
    processMethod: bean?.process_method ?? null,
    variety: bean?.variety ?? null,
    roastLevel: row.roast_level,
    weightGrams: row.weight_grams,
  } satisfies Record<FieldKey, string | number | null>;
}

function compareFields(existing: Record<FieldKey, string | number | null>, candidate: Record<FieldKey, string | number | null>) {
  const keys: FieldKey[] = ['beanName', 'originCountry', 'originRegion', 'processMethod', 'variety', 'roastLevel', 'weightGrams'];
  const comparedFields: ComparedField[] = [];

  for (const key of keys) {
    const existingValue = existing[key];
    const ocrValue = candidate[key];

    if (existingValue !== null && ocrValue !== null && !isSameValue(existingValue, ocrValue)) {
      comparedFields.push({ field: key, existingValue, ocrValue, kind: 'mismatch' });
      continue;
    }
    if (existingValue === null && ocrValue !== null) {
      comparedFields.push({ field: key, existingValue, ocrValue, kind: 'missing_in_db' });
      continue;
    }
    if (existingValue !== null && ocrValue === null) {
      comparedFields.push({ field: key, existingValue, ocrValue, kind: 'missing_in_ocr' });
    }
  }

  return comparedFields;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const db = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await db
    .from('roaster_beans')
    .select(
      'id, display_name, roast_level, weight_grams, image_url, status, source_item_id, source_sku_id, product_url, beans(canonical_name, origin_country, origin_region, process_method, variety)'
    )
    .not('source_item_id', 'is', null)
    .not('image_url', 'is', null)
    .in('status', ['ACTIVE', 'DRAFT'])
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const rows = ((data ?? []) as AuditRow[]).slice(0, args.limit);
  const entries: AuditEntry[] = [];

  for (const row of rows) {
    if (!row.image_url) continue;

    const ocr = await runOcrFromImageUrl(row.image_url);
    const parsed = parseBeanCandidateFromSources({
      displayName: row.display_name,
      titleText: '',
      ocrText: ocr.text,
    });

    const existing = pickFields(row);
    const candidate = {
      beanName: parsed.beanName,
      originCountry: parsed.originCountry,
      originRegion: parsed.originRegion,
      processMethod: parsed.processMethod,
      variety: parsed.variety,
      roastLevel: parsed.roastLevel,
      weightGrams: parsed.weightGrams,
    } satisfies Record<FieldKey, string | number | null>;

    entries.push({
      id: row.id,
      title: row.display_name,
      status: row.status,
      sourceItemId: row.source_item_id,
      sourceSkuId: row.source_sku_id,
      productUrl: row.product_url,
      imageUrl: row.image_url,
      existing,
      ocr: {
        text: ocr.text,
        confidence: ocr.confidence,
        warnings: ocr.warnings,
        candidate,
      },
      comparedFields: compareFields(existing, candidate),
    });
  }

  const suspicious = entries.filter(
    (entry) => entry.comparedFields.some((field) => field.kind === 'mismatch' || field.kind === 'missing_in_db') || entry.ocr.warnings.length > 0
  );

  const summary = {
    scanned: entries.length,
    suspicious: suspicious.length,
    mismatches: suspicious.filter((entry) => entry.comparedFields.some((field) => field.kind === 'mismatch')).length,
    missingInDb: suspicious.filter((entry) => entry.comparedFields.some((field) => field.kind === 'missing_in_db')).length,
    ocrWarnings: suspicious.filter((entry) => entry.ocr.warnings.length > 0).length,
  };

  await writeFile(
    args.output,
    JSON.stringify(
      {
        summary,
        suspicious,
        all: entries,
      },
      null,
      2
    )
  );

  console.log(JSON.stringify({ output: args.output, summary }, null, 2));
  for (const entry of suspicious.slice(0, 20)) {
    console.log(
      JSON.stringify({
        id: entry.id,
        title: entry.title,
        status: entry.status,
        warnings: entry.ocr.warnings,
        comparedFields: entry.comparedFields.filter((field) => field.kind !== 'missing_in_ocr'),
      })
    );
  }
}

await main();
