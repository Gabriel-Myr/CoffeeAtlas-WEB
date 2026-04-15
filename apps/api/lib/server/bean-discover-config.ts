import type { BeanDiscoverContinent } from '@coffee-atlas/shared-types';
import { readLightQuestionCopyConfig } from './light-question-copy.ts';

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
];

export async function getBeanDiscoverEditorialConfigs(): Promise<EditorialPickConfig[]> {
  const config = await readLightQuestionCopyConfig();
  return config.api.editorialConfigs.length > 0 ? config.api.editorialConfigs : BEAN_DISCOVER_EDITORIAL_CONFIGS;
}
