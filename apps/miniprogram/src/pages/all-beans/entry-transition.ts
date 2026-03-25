import { resolveAllBeansEntryState, type AllBeansLandingMode } from './route-params.ts';
import type { AllBeansEntryIntent } from './entry-intent-store.ts';

type TabKey = 'discover' | 'sales' | 'new';

export interface AllBeansDidShowTransitionInput {
  params: Record<string, unknown> | null;
  entryIntent: AllBeansEntryIntent | null;
  activeTab: TabKey;
  landingMode: AllBeansLandingMode;
}

export interface AllBeansDidShowTransitionResult {
  shouldApply: boolean;
  nextActiveTab: TabKey;
  nextLandingMode: AllBeansLandingMode;
  shouldChangeTab: boolean;
  shouldResetPageState: boolean;
}

export function resolveAllBeansDidShowTransition(
  input: AllBeansDidShowTransitionInput
): AllBeansDidShowTransitionResult {
  if (!input.entryIntent) {
    return {
      shouldApply: false,
      nextActiveTab: input.activeTab,
      nextLandingMode: input.landingMode,
      shouldChangeTab: false,
      shouldResetPageState: false,
    };
  }

  const nextState = resolveAllBeansEntryState(input.params, input.entryIntent);
  return {
    shouldApply: true,
    nextActiveTab: nextState.activeTab,
    nextLandingMode: nextState.landingMode,
    shouldChangeTab: nextState.activeTab !== input.activeTab,
    shouldResetPageState: true,
  };
}
