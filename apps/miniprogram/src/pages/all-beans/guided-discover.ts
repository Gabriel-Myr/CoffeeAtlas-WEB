import type { AllBeansLandingMode } from './route-params.ts';

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
    return {
      step: 'done',
      title: '已经帮你缩小到一条可直接浏览的路径',
      description: '你可以直接往下看推荐和豆单，也可以重新回答一次，换一条路线。',
    };
  }

  if (!isSelected(input.selectedProcessBase)) {
    return {
      step: 'process_base',
      title: '先告诉我你想从哪种基础处理法开始',
      description: '我会先帮你定一个基础处理法方向，再继续收窄到处理风格和产地区域。',
    };
  }

  if (!isSelected(input.selectedProcessStyle)) {
    return {
      step: 'process_style',
      title: '第二步，再选一个处理风格',
      description: '基础处理法已经定好了，现在继续缩小到更具体的处理风格。',
    };
  }

  if (!isSelected(input.selectedContinent)) {
    return {
      step: 'continent',
      title: '下一步，选一个更接近你期待风味的区域',
      description: '处理风格已经定好了，现在再用大洲和国家把结果继续缩小。',
    };
  }

  if (!isSelected(input.selectedCountry)) {
    return {
      step: 'country',
      title: '先看下要不要继续缩小到具体国家',
      description: '大洲已经定好了，再选一个国家，就能直接看到更聚焦的豆单。',
    };
  }

  return {
    step: 'variety',
    title: '最后一步，可以再按豆种细分',
    description: '这一步是可选的。你可以直接看结果，也可以再按豆种把范围缩小一点。',
  };
}

export function shouldExpandGuidedDiscoverCard(landingMode: AllBeansLandingMode): boolean {
  return landingMode === 'guided';
}
