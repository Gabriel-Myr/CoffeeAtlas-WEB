import type { RoasterFavoriteSnapshot, RoasterFavoriteSnapshotInput } from './mappers';
import { toRoasterFavoriteSnapshot } from './mappers';

export type { RoasterFavoriteSnapshot, RoasterFavoriteSnapshotInput } from './mappers';

export function toCatalogRoasterSnapshot<T extends RoasterFavoriteSnapshotInput>(
  roaster: T
): RoasterFavoriteSnapshot {
  return toRoasterFavoriteSnapshot(roaster);
}
