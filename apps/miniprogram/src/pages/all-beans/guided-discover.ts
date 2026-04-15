import type { AllBeansLandingMode } from './route-params.ts';
import { LIGHT_QUESTION_COPY, type GuidedStepKey } from './light-question-copy.ts';

const ALL_DISCOVER_VALUE = 'all';

export type GuidedProcessChoiceId = 'clean' | 'fruity' | 'sweet';
export type GuidedProcessStyleChoiceId = 'classic' | 'anaerobic' | 'experimental';
export type GuidedContinentChoiceId = 'floral' | 'balanced' | 'bold';

export interface GuidedDiscoverOption {
  id: string;
  label: string;
}

export interface GuidedDiscoverStepInput {
  selectedProcessBase: string;
  selectedProcessStyle: string;
  selectedContinent: string;
  selectedCountry: string;
  selectedVariety: string;
}

export interface GuidedDiscoverStep {
  step: 'process_base' | 'process_style' | 'continent' | 'country' | 'variety' | 'done';
  title: string;
  description: string;
}

export const GUIDED_PROCESS_CHOICES = LIGHT_QUESTION_COPY.miniprogram.guidedCard.processChoices as Array<{
  id: GuidedProcessChoiceId;
  title: string;
  description: string;
}>;

export const GUIDED_PROCESS_STYLE_CHOICES = LIGHT_QUESTION_COPY.miniprogram.guidedCard.processStyleChoices as Array<{
  id: GuidedProcessStyleChoiceId;
  title: string;
  description: string;
}>;

export const GUIDED_CONTINENT_CHOICES = LIGHT_QUESTION_COPY.miniprogram.guidedCard.continentChoices as Array<{
  id: GuidedContinentChoiceId;
  title: string;
  description: string;
}>;

type KeywordGroups = string[][];

const PROCESS_KEYWORD_GROUPS: Record<GuidedProcessChoiceId, KeywordGroups> = {
  clean: [
    ['washed', 'wash', '水洗'],
    ['clean', '清爽'],
  ],
  fruity: [
    ['natural', '日晒'],
    ['fruit', 'fruity', '果'],
  ],
  sweet: [
    ['honey', '蜜处理'],
    ['sweet', '甜感'],
  ],
};

const PROCESS_STYLE_KEYWORD_GROUPS: Record<GuidedProcessStyleChoiceId, KeywordGroups> = {
  classic: [['traditional', '传统']],
  anaerobic: [['anaerobic', '厌氧']],
  experimental: [
    ['yeast', '酵母'],
    ['carbonic', '二氧化碳'],
    ['thermal', '热冲击'],
    ['other', '其他'],
  ],
};

const CONTINENT_KEYWORD_GROUPS: Record<GuidedContinentChoiceId, KeywordGroups> = {
  floral: [['africa', '非洲']],
  balanced: [['americas', 'america', '美洲']],
  bold: [['asia', '亚洲']],
};

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function matchWithKeyword(option: GuidedDiscoverOption, keyword: string): boolean {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;
  const optionId = normalizeText(option.id);
  const optionLabel = normalizeText(option.label);
  return optionId.includes(normalizedKeyword) || optionLabel.includes(normalizedKeyword);
}

function pickOptionByKeywordGroups(
  options: GuidedDiscoverOption[],
  keywordGroups: KeywordGroups
): GuidedDiscoverOption | null {
  for (const keywordGroup of keywordGroups) {
    const matched = options.find((option) => keywordGroup.some((keyword) => matchWithKeyword(option, keyword)));
    if (matched) {
      return {
        id: matched.id,
        label: matched.label,
      };
    }
  }

  return null;
}

function isSelected(value: string): boolean {
  return typeof value === 'string' && value !== ALL_DISCOVER_VALUE;
}

function getGuidedStepCopy(step: GuidedStepKey): GuidedDiscoverStep {
  const copy = LIGHT_QUESTION_COPY.miniprogram.guidedCard.steps[step];
  return {
    step,
    title: copy.title,
    description: copy.description,
  };
}

export function resolveGuidedProcessSelection(
  choice: GuidedProcessChoiceId,
  options: GuidedDiscoverOption[]
): GuidedDiscoverOption | null {
  return pickOptionByKeywordGroups(options, PROCESS_KEYWORD_GROUPS[choice]);
}

export function resolveGuidedProcessStyleSelection(
  choice: GuidedProcessStyleChoiceId,
  options: GuidedDiscoverOption[]
): GuidedDiscoverOption | null {
  return pickOptionByKeywordGroups(options, PROCESS_STYLE_KEYWORD_GROUPS[choice]);
}

export function resolveGuidedContinentSelection(
  choice: GuidedContinentChoiceId,
  options: GuidedDiscoverOption[]
): GuidedDiscoverOption | null {
  return pickOptionByKeywordGroups(options, CONTINENT_KEYWORD_GROUPS[choice]);
}

export function buildGuidedDiscoverStep(input: GuidedDiscoverStepInput): GuidedDiscoverStep {
  if (isSelected(input.selectedVariety)) {
    return getGuidedStepCopy('done');
  }

  if (!isSelected(input.selectedProcessBase)) {
    return getGuidedStepCopy('process_base');
  }

  if (!isSelected(input.selectedProcessStyle)) {
    return getGuidedStepCopy('process_style');
  }

  if (!isSelected(input.selectedContinent)) {
    return getGuidedStepCopy('continent');
  }

  if (!isSelected(input.selectedCountry)) {
    return getGuidedStepCopy('country');
  }

  return getGuidedStepCopy('variety');
}

export function shouldExpandGuidedDiscoverCard(_landingMode: AllBeansLandingMode): boolean {
  return false;
}

export function shouldShowGuidedDiscoverCard(_landingMode: AllBeansLandingMode): boolean {
  return false;
}
