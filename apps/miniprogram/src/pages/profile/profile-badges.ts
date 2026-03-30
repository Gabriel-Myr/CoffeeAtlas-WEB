type ProfileBadgeIconName = 'coffee' | 'user' | 'globe' | 'map-pin' | 'heart' | 'heart-filled' | 'share';
type BadgeMetricKey = 'loggedIn' | 'beanFavorites' | 'roasterFavorites' | 'historyCount';

export interface BadgeMetricSnapshot {
  loggedIn: boolean;
  beanFavorites: number;
  roasterFavorites: number;
  historyCount: number;
}

export interface ProfileBadgeDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: ProfileBadgeIconName;
  metricKey: BadgeMetricKey;
  threshold: number;
  unlockedDescription: string;
}

export interface ProfileBadgeProgress extends ProfileBadgeDefinition {
  unlocked: boolean;
  currentValue: number;
  targetValue: number;
  remainingValue: number;
  progressLabel: string;
  detail: string;
}

const PROFILE_BADGE_DEFINITIONS: ProfileBadgeDefinition[] = [
  {
    id: 'visitor',
    title: '入馆访客',
    subtitle: '开始建立你的个人咖啡档案',
    icon: 'user',
    metricKey: 'loggedIn',
    threshold: 1,
    unlockedDescription: '你已经进入个人馆藏，后续探索都会记在这里。',
  },
  {
    id: 'bean-starter',
    title: '豆单初藏',
    subtitle: '收藏第一款豆子，开始积累偏好',
    icon: 'heart',
    metricKey: 'beanFavorites',
    threshold: 1,
    unlockedDescription: '你已经收藏了第一款豆子，个人口味开始成形。',
  },
  {
    id: 'bean-collector',
    title: '豆单收藏家',
    subtitle: '收藏 5 款豆子，形成更完整的豆单',
    icon: 'heart-filled',
    metricKey: 'beanFavorites',
    threshold: 5,
    unlockedDescription: '你的豆单已经有了明显轮廓，收藏正在变得更有体系。',
  },
  {
    id: 'roaster-radar',
    title: '烘焙雷达',
    subtitle: '收藏第一个烘焙商，开始追踪风格',
    icon: 'map-pin',
    metricKey: 'roasterFavorites',
    threshold: 1,
    unlockedDescription: '你已经开始关注烘焙商，探索不再只停留在单款豆子。',
  },
  {
    id: 'history-explorer',
    title: '风味漫游者',
    subtitle: '浏览 3 条记录，留下最初的探索足迹',
    icon: 'coffee',
    metricKey: 'historyCount',
    threshold: 3,
    unlockedDescription: '你的浏览足迹已经留下第一段轨迹，探索正在展开。',
  },
  {
    id: 'history-regular',
    title: '探索常客',
    subtitle: '浏览 10 条记录，让足迹变得稳定',
    icon: 'globe',
    metricKey: 'historyCount',
    threshold: 10,
    unlockedDescription: '你的探索已经形成连续记录，属于这张地图上的常客。',
  },
];

function getMetricValue(metrics: BadgeMetricSnapshot, key: BadgeMetricKey): number {
  switch (key) {
    case 'loggedIn':
      return metrics.loggedIn ? 1 : 0;
    case 'beanFavorites':
      return metrics.beanFavorites;
    case 'roasterFavorites':
      return metrics.roasterFavorites;
    case 'historyCount':
      return metrics.historyCount;
    default:
      return 0;
  }
}

function getLockedDetail(definition: ProfileBadgeDefinition, remainingValue: number): string {
  switch (definition.metricKey) {
    case 'loggedIn':
      return '登录后即可解锁这枚徽章。';
    case 'beanFavorites':
      return `再收藏 ${remainingValue} 款豆子可解锁。`;
    case 'roasterFavorites':
      return `再收藏 ${remainingValue} 个烘焙商可解锁。`;
    case 'historyCount':
      return `再浏览 ${remainingValue} 条记录可解锁。`;
    default:
      return '继续探索可解锁。';
  }
}

function getProgressLabel(unlocked: boolean, currentValue: number, targetValue: number): string {
  if (unlocked) {
    return '已完成';
  }

  return `${Math.min(currentValue, targetValue)}/${targetValue}`;
}

export function getProfileBadges(metrics: BadgeMetricSnapshot): ProfileBadgeProgress[] {
  return PROFILE_BADGE_DEFINITIONS.map((definition) => {
    const currentValue = getMetricValue(metrics, definition.metricKey);
    const targetValue = definition.threshold;
    const unlocked = currentValue >= targetValue;
    const remainingValue = unlocked ? 0 : targetValue - currentValue;

    return {
      ...definition,
      unlocked,
      currentValue,
      targetValue,
      remainingValue,
      progressLabel: getProgressLabel(unlocked, currentValue, targetValue),
      detail: unlocked ? definition.unlockedDescription : getLockedDetail(definition, remainingValue),
    };
  });
}
