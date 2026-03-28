import { NextRequest, NextResponse } from 'next/server';

import { toLegacyError } from '@/lib/server/api-helpers';
import { getBeanDetailV1 } from '@/lib/server/public-api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bean = await getBeanDetailV1(id);

    if (!bean) {
      return NextResponse.json({ error: 'Bean not found', code: 404 }, { status: 404 });
    }

    return NextResponse.json({ data: bean });
  } catch (error) {
    return toLegacyError(error);
  }
}
