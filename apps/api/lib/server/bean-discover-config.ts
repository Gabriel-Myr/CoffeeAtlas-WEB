import type { BeanDiscoverContinent } from '@coffee-atlas/shared-types';

export interface EditorialPickConfig {
  id: string;
  match: {
    process?: string;
    continent?: BeanDiscoverContinent;
    country?: string;
  };
  title: string;
  subtitle: string;
  beanIds?: string[];
}

export const BEAN_DISCOVER_EDITORIAL_CONFIGS: EditorialPickConfig[] = [
  {
    id: 'default',
    match: {},
    title: '编辑推荐',
    subtitle: '从这些高辨识度豆款开始，最快建立对当前目录的第一印象。',
  },
  {
    id: 'washed-africa',
    match: {
      process: '水洗',
      continent: 'africa',
    },
    title: '东非水洗切面',
    subtitle: '优先看花香、柑橘和明亮酸质都更清晰的代表性样本。',
  },
  {
    id: 'natural-americas',
    match: {
      process: '日晒',
      continent: 'americas',
    },
    title: '美洲日晒精选',
    subtitle: '从更甜、更熟果、更饱满的轮廓开始理解日晒在美洲的表现。',
  },
  {
    id: 'ethiopia-focus',
    match: {
      country: '埃塞俄比亚',
    },
    title: '埃塞俄比亚精选',
    subtitle: '先从最具辨识度的花香与柑橘调性切入，再慢慢比较不同处理法。',
  },
  {
    id: 'colombia-focus',
    match: {
      country: '哥伦比亚',
    },
    title: '哥伦比亚精选',
    subtitle: '以平衡、甜感和清晰结构为主线，适合做国家风味的入门样本。',
  },
];
