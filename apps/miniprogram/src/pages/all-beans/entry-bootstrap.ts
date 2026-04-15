import type { GuidedSeedState } from './guided-seed-store.ts';
import type { AllBeansDidShowTransitionResult } from './entry-transition.ts';

export interface AllBeansEntryBootstrapInput {
  guidedSeed: GuidedSeedState | null;
  transition: AllBeansDidShowTransitionResult;
}

export interface AllBeansEntryBootstrapResult {
  shouldResetPageState: boolean;
  nextPendingGuidedSeed: GuidedSeedState | null;
}

export function resolveAllBeansEntryBootstrap(
  input: AllBeansEntryBootstrapInput
): AllBeansEntryBootstrapResult {
  return {
    shouldResetPageState: input.transition.shouldResetPageState,
    nextPendingGuidedSeed: input.guidedSeed,
  };
}
