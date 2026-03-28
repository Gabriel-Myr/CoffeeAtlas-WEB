export const ONBOARDING_PAGE_URL = '/pages/onboarding/index'

export interface RestartOnboardingAdapter {
  clearProfile: () => void
  relaunch: (url: string) => void
}

export function restartOnboarding(adapter: RestartOnboardingAdapter): void {
  adapter.clearProfile()
  adapter.relaunch(ONBOARDING_PAGE_URL)
}
