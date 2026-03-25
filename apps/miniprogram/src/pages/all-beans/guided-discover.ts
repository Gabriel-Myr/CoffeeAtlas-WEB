import type { AllBeansLandingMode } from './route-params';

const ALL_DISCOVER_VALUE = 'all';

export type GuidedProcessChoiceId = 'clean' | 'fruity' | 'adventurous';
export type GuidedContinentChoiceId = 'floral' | 'balanced' | 'bold';

export interface GuidedDiscoverOption {
  id: string;
  label: string;
}

export interface GuidedDiscoverStepInput {
  selectedProcess: string;
  selectedContinent: string;
  selectedCountry: string;
}

export interface GuidedDiscoverStep {
  step: 'process' | 'continent' | 'done';
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
    ['honey', '蜜处理'],
    ['fruit', 'fruity', '果'],
  ],
  adventurous: [
    ['anaerobic', '厌氧'],
    ['experimental', '实验'],
    ['coferment', 'co-ferment', 'infused', '特殊发酵'],
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
  return value !== ALL_DISCOVER_VALUE;
}

export function resolveGuidedProcessSelection(
  choice: GuidedProcessChoiceId,
  options: GuidedDiscoverOption[]
): GuidedDiscoverOption | null {
  return pickOptionByKeywordGroups(options, PROCESS_KEYWORD_GROUPS[choice]);
}

export function resolveGuidedContinentSelection(
  choice: GuidedContinentChoiceId,
  options: GuidedDiscoverOption[]
): GuidedDiscoverOption | null {
  return pickOptionByKeywordGroups(options, CONTINENT_KEYWORD_GROUPS[choice]);
}

export function buildGuidedDiscoverStep(input: GuidedDiscoverStepInput): GuidedDiscoverStep {
  if (isSelected(input.selectedContinent) || isSelected(input.selectedCountry)) {
    return {
      step: 'done',
      title: '已经帮你缩小到一条可直接浏览的路径',
      description: '你可以直接往下看推荐和豆单，也可以重新回答一次，换一条路线。',
    };
  }

  if (!isSelected(input.selectedProcess)) {
    return {
      step: 'process',
      title: '先告诉我你更想从哪种杯感开始',
      description: '我会先帮你定一个处理法方向，再继续缩小到更适合的产地区域。',
    };
  }

  return {
    step: 'continent',
    title: '下一步，选一个更接近你期待风味的区域',
    description: '处理法已经帮你定好了，现在再用产地区域把结果继续缩小。',
  };
}

export function resolveLandingModeAfterTabChange(input: {
  currentMode: AllBeansLandingMode;
  preserveLandingMode: boolean;
  nextMode?: AllBeansLandingMode;
}): AllBeansLandingMode {
  if (input.preserveLandingMode) {
    return input.nextMode ?? input.currentMode;
  }

  return 'default';
}
