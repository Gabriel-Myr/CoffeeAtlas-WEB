import Taro from '@tarojs/taro';
import {
  createEntryIntentStore,
  type AllBeansEntryIntent,
} from './entry-intent-store.ts';

export type { AllBeansEntryIntent };

const ENTRY_INTENT_KEY = 'all_beans_entry_intent';

const taroEntryIntentStore = createEntryIntentStore({
  get: () => Taro.getStorageSync(ENTRY_INTENT_KEY),
  set: (intent) => Taro.setStorageSync(ENTRY_INTENT_KEY, intent),
  remove: () => Taro.removeStorageSync(ENTRY_INTENT_KEY),
});

export function setAllBeansEntryIntent(intent: AllBeansEntryIntent): void {
  taroEntryIntentStore.setIntent(intent);
}

export function consumeAllBeansEntryIntent(): AllBeansEntryIntent | null {
  return taroEntryIntentStore.consumeIntent();
}
