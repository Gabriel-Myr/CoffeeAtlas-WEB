import assert from 'node:assert/strict';
import test from 'node:test';

import { mapBeanCard, mapBeanDetail } from '../lib/server/public-beans.ts';

const beanFixture = {
  id: 'bean-001',
  name: 'Ethiopia Guji G1',
  roasterId: 'roaster-001',
  roasterName: 'Cloud Roaster',
  city: 'Shanghai',
  originCountry: 'Ethiopia',
  originRegion: 'Guji',
  farm: 'Bookisa',
  variety: 'Heirloom',
  process: 'Washed',
  roastLevel: 'Light',
  price: 108,
  discountedPrice: 98,
  currency: 'CNY',
  salesCount: 321,
  tastingNotes: ['jasmine', 'peach'],
  imageUrl: 'https://example.com/bean-001.jpg',
  isInStock: true,
  isNewArrival: true,
};

test('mapBeanCard keeps catalog card contract stable', () => {
  const card = mapBeanCard(beanFixture);

  assert.equal(card.id, 'bean-001');
  assert.equal(card.name, 'Ethiopia Guji G1');
  assert.equal(card.roasterId, 'roaster-001');
  assert.equal(card.roasterName, 'Cloud Roaster');
  assert.equal(card.originCountry, 'Ethiopia');
  assert.equal(card.process, 'Washed');
  assert.equal(card.roastLevel, 'Light');
  assert.equal(card.price, 108);
  assert.equal(card.currency, 'CNY');
  assert.equal(card.salesCount, 321);
  assert.equal(card.imageUrl, 'https://example.com/bean-001.jpg');
  assert.equal(card.isInStock, true);
  assert.equal(card.originRegion, 'Guji');
  assert.equal(card.farm, 'Bookisa');
  assert.equal(card.variety, 'Heirloom');
  assert.equal(card.discountedPrice, 98);
  assert.deepEqual(card.tastingNotes, ['jasmine', 'peach']);
  assert.equal(card.isNewArrival, true);
});

test('mapBeanDetail keeps required detail fields available', () => {
  const detail = mapBeanDetail(beanFixture);

  assert.equal(detail.id, 'bean-001');
  assert.equal(detail.name, 'Ethiopia Guji G1');
  assert.equal(detail.roasterId, 'roaster-001');
  assert.equal(detail.roasterName, 'Cloud Roaster');
  assert.equal(detail.originCountry, 'Ethiopia');
  assert.equal(detail.originRegion, 'Guji');
  assert.equal(detail.farm, 'Bookisa');
  assert.equal(detail.variety, 'Heirloom');
  assert.equal(detail.process, 'Washed');
  assert.equal(detail.roastLevel, 'Light');
  assert.equal(detail.price, 108);
  assert.equal(detail.discountedPrice, 98);
  assert.equal(detail.currency, 'CNY');
  assert.equal(detail.imageUrl, 'https://example.com/bean-001.jpg');
  assert.equal(detail.isInStock, true);
  assert.deepEqual(detail.tastingNotes, ['jasmine', 'peach']);
  assert.equal(detail.isNewArrival, true);
});
