import type { AllBeansLandingMode } from './route-params';

const ALL_DISCOVER_VALUE = 'all';

export interface DiscoverGuidance {
  label: string;
  title: string;
  description: string;
}

export interface DiscoverGuidanceInput {
  landingMode: AllBeansLandingMode;
  selectedProcess: string;
  selectedContinent: string;
  selectedCountry: string;
  searchQuery: string;
}

function isSelected(value: string): boolean {
  return value !== ALL_DISCOVER_VALUE;
}

export function buildDiscoverGuidance(input: DiscoverGuidanceInput): DiscoverGuidance {
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

  if (isSelected(input.selectedProcess)) {
    return {
      label: '下一步',
      title: '选一个大洲，让结果更聚焦',
      description: '你已经选了处理法，接下来选风土区域，国家列表也会跟着缩小。',
    };
  }

  if (input.landingMode === 'guided') {
    return {
      label: '推荐下一步',
      title: '先选一个处理法方向',
      description: '不用一次决定太多，先从杯型方向开始，后面再慢慢缩小到大洲和国家。',
    };
  }

  if (input.landingMode === 'direct') {
    return {
      label: '当前可操作',
      title: '直接选处理法，或先搜你熟悉的关键词',
      description: '如果你已经知道自己想看什么，可以马上叠加大洲和国家继续收窄结果。',
    };
  }

  return {
    label: '推荐下一步',
    title: '先选处理法，再逐步收窄到产地',
    description: '你可以从处理法开始，再按大洲和国家慢慢缩小范围。',
  };
}
