import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

interface RoasterInput {
  roasterName: string;
  city?: string;
  countryCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { roasters?: RoasterInput[] };
    const roasters = Array.isArray(body.roasters) ? body.roasters : [];

    if (roasters.length === 0) {
      return NextResponse.json({ ok: false, error: 'roasters must be a non-empty array' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Create source
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .upsert(
        {
          source_type: 'IMPORT_FILE',
          source_name: 'roasters-batch-import',
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

    // Prepare roasters data
    const roastersData = roasters.map((r) => ({
      name: r.roasterName.trim(),
      city: r.city?.trim() || null,
      country_code: r.countryCode?.trim()?.toUpperCase() || null,
      is_public: true,
    }));

    // Insert roasters (upsert by name)
    const { data: insertedRoasters, error: roasterError } = await supabase
      .from('roasters')
      .upsert(
        roastersData.map((r) => ({
          ...r,
          // We'll use a different approach - insert only new ones
        })),
        { onConflict: 'name' }
      )
      .select('id, name');

    // Actually, let's do a different approach - insert only if not exists
    const results = [];
    let insertedCount = 0;
    let existedCount = 0;

    for (const r of roastersData) {
      // Check if exists
      const { data: existing } = await supabase
        .from('roasters')
        .select('id, name')
        .ilike('name', r.name)
        .limit(1)
        .single();

      if (existing) {
        existedCount++;
        results.push({ name: r.name, status: 'existed', id: existing.id });
      } else {
        const { data: newRoaster, error: insertError } = await supabase
          .from('roasters')
          .insert(r)
          .select('id, name')
          .single();

        if (insertError) {
          return NextResponse.json(
            { ok: false, error: `Failed to insert ${r.name}: ${insertError.message}` },
            { status: 500 }
          );
        }

        insertedCount++;
        results.push({ name: r.name, status: 'inserted', id: newRoaster.id });
      }
    }

    return NextResponse.json({
      ok: true,
      summary: {
        total: roasters.length,
        inserted: insertedCount,
        existed: existedCount,
      },
      results,
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
