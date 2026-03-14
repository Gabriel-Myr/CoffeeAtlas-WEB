import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true, service: 'coffeestories-webdb', ts: new Date().toISOString() });
}
