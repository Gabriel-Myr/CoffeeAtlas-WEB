export interface GuidedSeedStore {
  setState: (state: GuidedSeedState) => void;
  consumeState: () => GuidedSeedState | null;
}

export interface GuidedSeedState {
  processBase: string | null;
  processStyle: string | null;
  continent: string | null;
  country: string | null;
  variety: string | null;
}

export interface GuidedSeedStorageAdapter {
  get: () => unknown;
  set: (state: GuidedSeedState) => void;
  remove: () => void;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isGuidedSeedState(value: unknown): value is GuidedSeedState {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;
  return (
    isNullableString(candidate.processBase) &&
    isNullableString(candidate.processStyle) &&
    isNullableString(candidate.continent) &&
    isNullableString(candidate.country) &&
    isNullableString(candidate.variety)
  );
}

export function createGuidedSeedStore(adapter: GuidedSeedStorageAdapter): GuidedSeedStore {
  return {
    setState: (state) => {
      adapter.set(state);
    },
    consumeState: () => {
      const stored = adapter.get();
      if (!isGuidedSeedState(stored)) {
        adapter.remove();
        return null;
      }

      adapter.remove();
      return stored;
    },
  };
}
