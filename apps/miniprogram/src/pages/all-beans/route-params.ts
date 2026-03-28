import type { AllBeansEntryIntent } from './entry-intent-store.ts';

export type AllBeansLandingMode = 'default' | 'guided' | 'direct';

export interface AllBeansRouteState {
  landingMode: AllBeansLandingMode;
}

function normalizeParam(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function resolveAllBeansRouteParams(params?: Record<string, unknown> | null): AllBeansRouteState {
  const entryParam = normalizeParam(params?.entry);

  if (entryParam === 'guided' || entryParam === 'direct') {
    return { landingMode: entryParam };
  }

  return { landingMode: 'default' };
}

export function resolveAllBeansEntryState(
  params: Record<string, unknown> | null | undefined,
  entryIntent: AllBeansEntryIntent | null
): AllBeansRouteState {
  if (entryIntent === 'guided' || entryIntent === 'direct') {
    return { landingMode: entryIntent };
  }

  return resolveAllBeansRouteParams(params);
}
