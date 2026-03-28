import type { OnboardingExperienceLevel } from '../../utils/storage.ts';

export const ONBOARDING_OPTION_COPY = {
  beginner: {
    label: '新手',
    meta: '不懂产地也能开始',
  },
  intermediate: {
    label: '有一点经验',
    meta: '自己筛选目标豆子',
  },
} as const;

export function getOnboardingSelectionNote(level: OnboardingExperienceLevel | null): string {
  if (level === 'beginner') {
    return '会先进入更轻松的引导入口，先定方向，再逐步缩小到合适豆单。';
  }

  if (level === 'intermediate') {
    return '会进入同一个发现页，引导卡默认收起；需要时再展开，用自己的节奏筛选豆子。';
  }

  return '两种方式都会进入同一个发现页，只是默认引导强度不同。';
}
