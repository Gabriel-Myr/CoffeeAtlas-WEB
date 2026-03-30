import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDecisionPatch,
  filterPendingReviewItems,
  type ReviewDecision,
  type ReviewItem,
} from '../lib/taobao-sync/review.ts';

test('buildDecisionPatch keeps only non-empty editable fields and note metadata', () => {
  const patch = buildDecisionPatch({
    nextStatus: 'DRAFT',
    note: '图片里写的是日晒，不是水洗',
    fields: {
      beanName: '',
      originCountry: 'Colombia',
      processMethod: 'Natural',
      roastLevel: '',
      weightGrams: '100',
    },
  });

  assert.deepEqual(patch, {
    changes: {
      originCountry: 'Colombia',
      processMethod: 'Natural',
      weightGrams: 100,
    },
    nextStatus: 'DRAFT',
    note: '图片里写的是日晒，不是水洗',
  });
});

test('filterPendingReviewItems hides items that already have a submitted decision', () => {
  const items: ReviewItem[] = [
    {
      id: 'rb-1',
      title: 'A',
      status: 'ACTIVE',
      sourceItemId: '1',
      sourceSkuId: null,
      productUrl: null,
      imageUrl: null,
      ocr: { text: 'A', confidence: 'high', warnings: [] },
      highConfidenceIssues: [],
      fillCandidates: [],
    },
    {
      id: 'rb-2',
      title: 'B',
      status: 'ACTIVE',
      sourceItemId: '2',
      sourceSkuId: null,
      productUrl: null,
      imageUrl: null,
      ocr: { text: 'B', confidence: 'high', warnings: [] },
      highConfidenceIssues: [],
      fillCandidates: [],
    },
  ];

  const decisions: ReviewDecision[] = [
    {
      reviewItemId: 'rb-1',
      entityId: 'rb-1',
      entityType: 'ROASTER_BEAN',
      patch: {
        changes: { processMethod: 'Natural' },
        nextStatus: 'DRAFT',
        note: 'reviewed',
      },
      createdAt: '2026-03-30T12:00:00.000Z',
      persistedToDb: false,
    },
  ];

  const pending = filterPendingReviewItems(items, decisions);

  assert.equal(pending.length, 1);
  assert.equal(pending[0]?.id, 'rb-2');
});
