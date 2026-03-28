import { resolveAllBeansEntryState, type AllBeansLandingMode } from './route-params.ts';
import type { AllBeansEntryIntent } from './entry-intent-store.ts';

export interface AllBeansDidShowTransitionInput {
  params: Record<string, unknown> | null;
  entryIntent: AllBeansEntryIntent | null;
  landingMode: AllBeansLandingMode;
}

export interface AllBeansDidShowTransitionResult {
  shouldApply: boolean;
  nextLandingMode: AllBeansLandingMode;
  shouldResetPageState: boolean;
}

export function resolveAllBeansDidShowTransition(
  input: AllBeansDidShowTransitionInput
): AllBeansDidShowTransitionResult {
  if (!input.entryIntent) {
    return {
      shouldApply: false,
      nextLandingMode: input.landingMode,
      shouldResetPageState: false,
    };
  }

  const nextState = resolveAllBeansEntryState(input.params, input.entryIntent);
  return {
    shouldApply: true,
    nextLandingMode: nextState.landingMode,
    shouldResetPageState: true,
  };
}
