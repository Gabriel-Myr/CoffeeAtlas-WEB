import type { AllBeansLandingMode } from './route-params.ts';

export interface DiscoverGuidanceInput {
  landingMode: AllBeansLandingMode;
  selectedProcessBase: string;
  selectedProcessStyle: string;
  selectedContinent: string;
  selectedCountry: string;
  searchQuery: string;
}

export function buildDiscoverGuidance(_input: DiscoverGuidanceInput): null {
  return null;
}
