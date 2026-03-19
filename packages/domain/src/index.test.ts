import assert from 'node:assert/strict';
import test from 'node:test';

import { toBeanFavoriteSnapshot, toRoasterFavoriteSnapshot } from '../dist/mappers.js';
import { validateSnapshotId } from '../dist/validation.js';

test('toBeanFavoriteSnapshot keeps only lightweight favorite fields', () => {
  assert.deepEqual(
    toBeanFavoriteSnapshot({
      id: 'bean-1',
      name: '桃桃乌龙',
      roasterId: 'roaster-1',
      roasterName: 'Metal Hands',
      city: '上海',
      originCountry: '埃塞俄比亚',
      originRegion: '耶加雪菲',
      farm: 'Test Farm',
      variety: '74110',
      process: '水洗',
      roastLevel: '浅烘',
      price: 128,
      discountedPrice: 118,
      currency: 'CNY',
      salesCount: 20,
      imageUrl: 'https://example.com/bean.jpg',
      tastingNotes: ['柑橘', '花香'],
      isInStock: true,
      isNewArrival: true,
    }),
    {
      id: 'bean-1',
      name: '桃桃乌龙',
      roasterName: 'Metal Hands',
      imageUrl: 'https://example.com/bean.jpg',
      originCountry: '埃塞俄比亚',
      process: '水洗',
      price: 128,
    }
  );
});

test('toRoasterFavoriteSnapshot keeps portable roaster fields', () => {
  assert.deepEqual(
    toRoasterFavoriteSnapshot({
      id: 'roaster-1',
      name: 'Metal Hands',
      city: '上海',
      beanCount: 12,
      description: '城市烘焙',
      logoUrl: 'https://example.com/logo.jpg',
      coverImageUrl: 'https://example.com/cover.jpg',
      taobaoUrl: 'https://shop.example.com',
      xiaohongshuUrl: 'https://xh.example.com',
      websiteUrl: 'https://brand.example.com',
      instagramHandle: '@metalhands',
      beans: [],
    }),
    {
      id: 'roaster-1',
      name: 'Metal Hands',
      city: '上海',
      description: '城市烘焙',
      logoUrl: 'https://example.com/logo.jpg',
      coverImageUrl: 'https://example.com/cover.jpg',
      taobaoUrl: 'https://shop.example.com',
      xiaohongshuUrl: 'https://xh.example.com',
      websiteUrl: 'https://brand.example.com',
      beanCount: 12,
    }
  );
});

test('validateSnapshotId rejects blank ids', () => {
  assert.equal(validateSnapshotId('bean-1'), true);
  assert.equal(validateSnapshotId('   '), false);
});
