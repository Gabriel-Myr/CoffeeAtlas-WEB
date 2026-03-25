import type { AllBeansEntryIntent } from './entry-intent-store';

export type AllBeansLandingMode = 'default' | 'guided' | 'direct';

export interface AllBeansRouteState {
  activeTab: 'discover' | 'sales' | 'new';
  landingMode: AllBeansLandingMode;
}

const VALID_TABS: AllBeansRouteState['activeTab'][] = ['discover', 'sales', 'new'];

function normalizeParam(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function resolveAllBeansRouteParams(params?: Record<string, unknown> | null): AllBeansRouteState {
  const tabParam = normalizeParam(params?.tab);
  const entryParam = normalizeParam(params?.entry);

  const activeTab = VALID_TABS.includes(tabParam as AllBeansRouteState['activeTab'])
    ? (tabParam as AllBeansRouteState['activeTab'])
    : 'discover';

  if (activeTab !== 'discover') {
    return { activeTab, landingMode: 'default' };
  }

  if (entryParam === 'guided' || entryParam === 'direct') {
    return { activeTab, landingMode: entryParam };
  }

  return { activeTab, landingMode: 'default' };
}

export function resolveAllBeansEntryState(
  params: Record<string, unknown> | null | undefined,
  entryIntent: AllBeansEntryIntent | null
): AllBeansRouteState {
  if (entryIntent === 'new') {
    return { activeTab: 'new', landingMode: 'default' };
  }

  if (entryIntent === 'guided' || entryIntent === 'direct') {
    return { activeTab: 'discover', landingMode: entryIntent };
  }

  return resolveAllBeansRouteParams(params);
}
