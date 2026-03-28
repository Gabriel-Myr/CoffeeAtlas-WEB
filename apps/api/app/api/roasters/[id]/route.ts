import { NextRequest, NextResponse } from 'next/server';

import { toLegacyError } from '@/lib/server/api-helpers';
import { getRoasterDetailV1 } from '@/lib/server/public-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const roaster = await getRoasterDetailV1(id);

    if (!roaster) {
      return NextResponse.json({ error: 'Roaster not found', code: 404 }, { status: 404 });
    }

    return NextResponse.json({ data: roaster });
  } catch (error) {
    return toLegacyError(error);
  }
}
