interface BadgeRecordCopyInput {
  loggedIn: boolean;
  totalSaved: number;
}

interface BadgeRecordCopy {
  eyebrow: string;
  title: string;
  description: string;
  hint: string;
}

export function getBadgeRecordCopy({ loggedIn, totalSaved }: BadgeRecordCopyInput): BadgeRecordCopy {
  if (!loggedIn) {
    return {
      eyebrow: 'BADGE RECORD',
      title: '徽章记录',
      description: '登录后，你的收藏、浏览和探索会逐步点亮这里的徽章。',
      hint: '先登录，后面再慢慢收集。',
    };
  }

  return {
    eyebrow: 'BADGE RECORD',
    title: '徽章记录',
    description: '你的徽章位已经准备好，继续收藏和浏览，记录会慢慢变丰富。',
    hint: `当前已沉淀 ${totalSaved} 条足迹，后续会在这里解锁展示。`,
  };
}
