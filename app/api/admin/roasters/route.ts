import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim();
    const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get('limit') ?? '50', 10) || 50, 1), 100);

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('roasters')
      .select('id, name, city, country_code')
      .order('name', { ascending: true })
      .limit(limit);

    if (q) {
      query = query.ilike('name', `%${q}%`);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json(
        { ok: false, error: `Roasters query failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: (data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        city: item.city,
        countryCode: item.country_code,
      })),
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
