import type { BeanFavoriteSnapshot, BeanFavoriteSnapshotInput } from './mappers';
import { toBeanFavoriteSnapshot } from './mappers';

export type { BeanFavoriteSnapshot, BeanFavoriteSnapshotInput } from './mappers';

export function toCatalogBeanSnapshot<T extends BeanFavoriteSnapshotInput>(
  bean: T
): BeanFavoriteSnapshot {
  return toBeanFavoriteSnapshot(bean);
}
