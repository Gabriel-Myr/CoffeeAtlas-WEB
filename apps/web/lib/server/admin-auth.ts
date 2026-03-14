import type { NextRequest } from 'next/server';

export interface AdminContext {
  actor: string;
}

export async function requireAdmin(_request: NextRequest): Promise<AdminContext> {
  // Placeholder gate for future admin auth integration.
  return {
    actor: 'admin-placeholder',
  };
}
