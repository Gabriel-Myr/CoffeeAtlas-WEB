import type { CatalogBeanCard } from '../catalog';
import type { RoasterSummary } from '../roasters';

export interface FavoriteRecordBase {
  id: string;
  user_id: string;
  target_id: string;
  created_at: string;
}

export interface BeanFavoriteRecord extends FavoriteRecordBase {
  target_type: 'bean';
  bean: CatalogBeanCard | null;
}

export interface RoasterFavoriteRecord extends FavoriteRecordBase {
  target_type: 'roaster';
  roaster: RoasterSummary | null;
}

export type UserFavorite = BeanFavoriteRecord | RoasterFavoriteRecord;
