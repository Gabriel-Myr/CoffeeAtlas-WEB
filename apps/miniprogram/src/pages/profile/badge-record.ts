interface NextBadgeSummary {
  title: string;
  detail: string;
}

interface BadgeRecordCopyInput {
  loggedIn: boolean;
  unlockedCount: number;
  totalCount: number;
  nextBadge?: NextBadgeSummary;
}

interface BadgeRecordCopy {
  eyebrow: string;
  title: string;
  description: string;
  hint: string;
}

export function getBadgeRecordCopy({
  loggedIn,
  unlockedCount,
  totalCount,
  nextBadge,
}: BadgeRecordCopyInput): BadgeRecordCopy {
  if (!loggedIn) {
    return {
      eyebrow: 'BADGE RECORD',
      title: '徽章记录',
      description: '登录后就能开始点亮你的咖啡探索徽章。',
      hint: '先解锁「入馆访客」，后面的探索记录会继续累积。',
    };
  }

  if (unlockedCount >= totalCount) {
    return {
      eyebrow: 'BADGE RECORD',
      title: '徽章记录',
      description: `已解锁 ${unlockedCount} / ${totalCount} 枚徽章，这一页已经被你点亮。`,
      hint: '首批徽章已全部拿下，后续新的探索徽章会继续加入。',
    };
  }

  return {
    eyebrow: 'BADGE RECORD',
    title: '徽章记录',
    description: `已解锁 ${unlockedCount} / ${totalCount} 枚徽章，继续把你的咖啡足迹补完整。`,
    hint: nextBadge ? `下一枚是「${nextBadge.title}」：${nextBadge.detail}` : '继续收藏和浏览，新的徽章会逐步点亮。',
  };
}
