import type { AllBeansEntryIntent } from '../all-beans/entry-intent-store';

export interface OnboardingNavigationInput {
  url: string;
  entryIntent: AllBeansEntryIntent | null;
}

export interface OnboardingNavigationAction {
  type: 'switchTab';
  url: string;
  entryIntent: AllBeansEntryIntent | null;
}

function stripQuery(url: string): string {
  return url.split('?')[0] ?? url;
}

export function resolveOnboardingNavigation(
  result: OnboardingNavigationInput
): OnboardingNavigationAction {
  return {
    type: 'switchTab',
    url: stripQuery(result.url),
    entryIntent: result.entryIntent,
  };
}
