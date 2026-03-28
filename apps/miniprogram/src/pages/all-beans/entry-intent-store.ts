export type AllBeansEntryIntent = 'guided' | 'direct';

export interface EntryIntentStore {
  setIntent: (intent: AllBeansEntryIntent) => void;
  consumeIntent: () => AllBeansEntryIntent | null;
}

export interface EntryIntentStorageAdapter {
  get: () => unknown;
  set: (intent: AllBeansEntryIntent) => void;
  remove: () => void;
}

function isEntryIntent(value: unknown): value is AllBeansEntryIntent {
  return value === 'guided' || value === 'direct';
}

export function createEntryIntentStore(adapter: EntryIntentStorageAdapter): EntryIntentStore {
  return {
    setIntent: (intent) => {
      adapter.set(intent);
    },
    consumeIntent: () => {
      const stored = adapter.get();
      if (!isEntryIntent(stored)) {
        adapter.remove();
        return null;
      }
      adapter.remove();
      return stored;
    },
  };
}
