import type { OnboardingExperienceLevel } from '../../utils/storage';

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
    return '会先进入探索首页，你可以从快捷入口继续进入发现区，自行筛选目标豆子。';
  }

  return '如果你还不熟悉咖啡豆，就先走引导入口；已经有目标的话，可以直接筛选。';
}
