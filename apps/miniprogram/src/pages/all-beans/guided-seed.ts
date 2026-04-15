import Taro from '@tarojs/taro';

import { createGuidedSeedStore } from './guided-seed-store.ts';
import type { GuidedSeedState } from './guided-seed-store.ts';

const GUIDED_SEED_KEY = 'all_beans_guided_seed';

const taroGuidedSeedStore = createGuidedSeedStore({
  get: () => Taro.getStorageSync(GUIDED_SEED_KEY),
  set: (state) => Taro.setStorageSync(GUIDED_SEED_KEY, state),
  remove: () => Taro.removeStorageSync(GUIDED_SEED_KEY),
});

export function setAllBeansGuidedSeed(state: GuidedSeedState): void {
  taroGuidedSeedStore.setState(state);
}

export function consumeAllBeansGuidedSeed(): GuidedSeedState | null {
  return taroGuidedSeedStore.consumeState();
}
