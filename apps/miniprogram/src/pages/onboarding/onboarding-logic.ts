import type { AllBeansEntryIntent } from '../all-beans/entry-intent-store';
import type { OnboardingExperienceLevel, OnboardingProfile } from '../../utils/storage';

export const ONBOARDING_INDEX_URL = '/pages/index/index';
export const ONBOARDING_ALL_BEANS_URL = '/pages/all-beans/index';
export const ONBOARDING_ALL_BEANS_GUIDED_URL = '/pages/all-beans/index?entry=guided';

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
    return { url: ONBOARDING_ALL_BEANS_GUIDED_URL, entryIntent: 'guided' };
  }

  return { url: ONBOARDING_INDEX_URL, entryIntent: null };
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
