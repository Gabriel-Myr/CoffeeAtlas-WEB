import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { ImportInputRow, PublishStatus } from '@/lib/types';

const STATUS_VALUES: PublishStatus[] = ['DRAFT', 'ACTIVE', 'ARCHIVED'];

function parseLimit(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (Number.isNaN(parsed)) return 20;
  return Math.min(Math.max(parsed, 1), 100);
}

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) return null;
  return n;
}

function asStatus(value: unknown): PublishStatus {
  if (typeof value === 'string' && STATUS_VALUES.includes(value as PublishStatus)) {
    return value as PublishStatus;
  }
  return 'DRAFT';
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function normalizeRow(row: ImportInputRow, rowNumber: number, jobId: string) {
  const roasterName = asString(row.roasterName);
  const beanName = asString(row.beanName);
  const displayName = asString(row.displayName);

  if (!roasterName || !beanName || !displayName) {
    throw new Error(`Row ${rowNumber}: roasterName, beanName, displayName are required`);
  }

  const priceAmount = asNumber(row.priceAmount);
  if (priceAmount !== null && priceAmount < 0) {
    throw new Error(`Row ${rowNumber}: priceAmount must be >= 0`);
  }

  return {
    import_job_id: jobId,
    row_number: rowNumber,
    roaster_name: roasterName,
    roaster_city: asString(row.city),
    roaster_country_code: asString(row.countryCode)?.toUpperCase() ?? null,
    bean_name: beanName,
    origin_country: asString(row.originCountry),
    origin_region: asString(row.originRegion),
    process_method: asString(row.processMethod),
    variety: asString(row.variety),
    display_name: displayName,
    roast_level: asString(row.roastLevel),
    price_amount: priceAmount,
    price_currency: (asString(row.priceCurrency)?.toUpperCase() ?? 'CNY').slice(0, 3),
    is_in_stock: asBoolean(row.isInStock, true),
    status: asStatus(row.status),
    product_url: asString(row.productUrl),
    flavor_tags: asTags(row.flavorTags),
    source_url: asString(row.sourceUrl),
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseLimit(url.searchParams.get('limit'));
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('import_jobs')
      .select('id, job_type, status, row_count, error_count, created_at, started_at, completed_at, summary')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data ?? [] });
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { sourceName?: string; rows?: ImportInputRow[] };
    const sourceName = asString(body.sourceName) ?? 'admin-api-import';
    const rows = Array.isArray(body.rows) ? body.rows : [];

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: 'rows must be a non-empty array' }, { status: 400 });
    }

    if (rows.length > 5000) {
      return NextResponse.json({ ok: false, error: 'rows exceeds limit (5000)' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .upsert(
        {
          source_type: 'IMPORT_FILE',
          source_name: sourceName,
          owner_label: 'admin-api',
          is_active: true,
        },
        { onConflict: 'source_type,source_name' }
      )
      .select('id')
      .single();

    if (sourceError || !source) {
      return NextResponse.json(
        { ok: false, error: sourceError?.message ?? 'Failed to upsert source' },
        { status: 500 }
      );
    }

    const { data: job, error: jobError } = await supabase
      .from('import_jobs')
      .insert({
        job_type: 'MANUAL_PATCH',
        status: 'PENDING',
        source_id: source.id,
        row_count: rows.length,
        summary: {
          transport: 'admin-api-json',
        },
      })
      .select('id')
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { ok: false, error: jobError?.message ?? 'Failed to create import job' },
        { status: 500 }
      );
    }

    let normalizedRows;
    try {
      normalizedRows = rows.map((row, index) => normalizeRow(row, index + 1, String(job.id)));
    } catch (normalizeError) {
      await supabase
        .from('import_jobs')
        .update({
          status: 'FAILED',
          error_count: rows.length,
          completed_at: new Date().toISOString(),
          summary: {
            error: normalizeError instanceof Error ? normalizeError.message : 'Row normalization failed',
          },
        })
        .eq('id', job.id);

      return NextResponse.json(
        {
          ok: false,
          error:
            normalizeError instanceof Error ? normalizeError.message : 'Invalid rows payload for import',
        },
        { status: 400 }
      );
    }

    const chunkSize = 500;
    for (let i = 0; i < normalizedRows.length; i += chunkSize) {
      const chunk = normalizedRows.slice(i, i + chunkSize);
      const { error: chunkError } = await supabase.from('staging_catalog_rows').insert(chunk);
      if (chunkError) {
        await supabase
          .from('import_jobs')
          .update({
            status: 'FAILED',
            error_count: rows.length,
            completed_at: new Date().toISOString(),
            summary: {
              error: chunkError.message,
            },
          })
          .eq('id', job.id);

        return NextResponse.json(
          {
            ok: false,
            error: `Failed to insert staging rows: ${chunkError.message}`,
          },
          { status: 500 }
        );
      }
    }

    const { data: summary, error: processError } = await supabase.rpc('process_staging_import', {
      p_job_id: job.id,
      p_source_id: source.id,
    });

    if (processError) {
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to process import job: ${processError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      jobId: job.id,
      summary,
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
