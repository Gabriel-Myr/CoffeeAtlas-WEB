import type { AllBeansEntryIntent } from '../all-beans/entry-intent-store.ts';
import type { OnboardingExperienceLevel, OnboardingProfile } from '../../utils/storage.ts';

export const ONBOARDING_INDEX_URL = '/pages/index/index';
export const ONBOARDING_ALL_BEANS_URL = '/pages/all-beans/index';
export const ONBOARDING_ALL_BEANS_GUIDED_URL = '/pages/all-beans/index?entry=guided';
export const ONBOARDING_ALL_BEANS_DIRECT_URL = '/pages/all-beans/index?entry=direct';
export const ONBOARDING_GUIDED_PAGE_URL = '/pages/onboarding-guided/index';

export interface OnboardingStorageAdapter {
  getProfile: () => OnboardingProfile | null;
  setProfile: (profile: OnboardingProfile) => void;
}

export interface OnboardingFlow {
  getRedirectUrl: () => string | null;
  complete: (level: OnboardingExperienceLevel) => {
    profile: OnboardingProfile;
    url: string;
    entryIntent: AllBeansEntryIntent | null;
  };
  skip: () => { url: string; entryIntent: null };
}

function resolveDestination(level: OnboardingExperienceLevel): {
  url: string;
  entryIntent: AllBeansEntryIntent | null;
} {
  if (level === 'beginner') {
    return { url: ONBOARDING_GUIDED_PAGE_URL, entryIntent: null };
  }

  return { url: ONBOARDING_ALL_BEANS_DIRECT_URL, entryIntent: 'direct' };
}

export function createOnboardingFlow(
  storage: OnboardingStorageAdapter,
  now: () => number = () => Date.now()
): OnboardingFlow {
  return {
    getRedirectUrl: () => {
      const profile = storage.getProfile();
      return profile ? ONBOARDING_INDEX_URL : null;
    },
    complete: (level) => {
      const profile: OnboardingProfile = {
        experienceLevel: level,
        completedAt: now(),
      };
      storage.setProfile(profile);
      const destination = resolveDestination(level);
      return {
        profile,
        url: destination.url,
        entryIntent: destination.entryIntent,
      };
    },
    skip: () => {
      return { url: ONBOARDING_INDEX_URL, entryIntent: null };
    },
  };
}
