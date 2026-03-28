import type { AllBeansLandingMode } from './route-params.ts';

const ALL_DISCOVER_VALUE = 'all';

export interface DiscoverGuidance {
  label: string;
  title: string;
  description: string;
}

export interface DiscoverGuidanceInput {
  landingMode: AllBeansLandingMode;
  selectedProcessBase: string;
  selectedProcessStyle: string;
  selectedContinent: string;
  selectedCountry: string;
  searchQuery: string;
}

function isSelected(value: string): boolean {
  return value !== ALL_DISCOVER_VALUE;
}

export function buildDiscoverGuidance(input: DiscoverGuidanceInput): DiscoverGuidance | null {
  if (isSelected(input.selectedCountry)) {
    return {
      label: '当前状态',
      title: '结果已经很聚焦，可以直接往下看豆单',
      description: '如果结果还是太多，再回头调整处理法；如果刚刚好，就继续看推荐和完整列表。',
    };
  }

  if (isSelected(input.selectedContinent)) {
    return {
      label: '下一步',
      title: '继续选国家，或先看当前结果',
      description: '现在已经缩到大洲级别了，想更精确就继续选国家；想先浏览也可以直接往下看。',
    };
  }

  if (isSelected(input.selectedProcessStyle)) {
    return {
      label: '下一步',
      title: '选一个大洲，让结果更聚焦',
      description: '你已经定好了基础处理法和风格，接下来选风土区域，国家列表也会跟着缩小。',
    };
  }

  if (isSelected(input.selectedProcessBase)) {
    return {
      label: '下一步',
      title: '再选一个处理风格，让路径更清楚',
      description: '基础处理法已经确定了，接下来再选传统、厌氧或其他特殊风格，结果会更贴近你的口味。',
    };
  }

  return null;
}
