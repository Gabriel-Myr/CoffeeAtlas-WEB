export type AllBeansEntryIntent = 'guided' | 'new' | 'direct';

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
  return value === 'guided' || value === 'new' || value === 'direct';
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
