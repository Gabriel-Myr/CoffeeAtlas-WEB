import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDecisionPatch,
  filterPendingReviewItems,
  sortReviewItems,
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

test('sortReviewItems puts hard conflicts before fill-only items while keeping bucket order stable', () => {
  const items: ReviewItem[] = [
    {
      id: 'fill-1',
      title: 'Fill First',
      status: 'ACTIVE',
      sourceItemId: '1',
      sourceSkuId: null,
      productUrl: null,
      imageUrl: null,
      ocr: { text: 'A', confidence: 'high', warnings: [] },
      highConfidenceIssues: [],
      fillCandidates: [{ field: 'weightGrams', existingValue: null, ocrValue: 100, kind: 'missing_in_db' }],
    },
    {
      id: 'hard-1',
      title: 'Hard First',
      status: 'ACTIVE',
      sourceItemId: '2',
      sourceSkuId: null,
      productUrl: null,
      imageUrl: null,
      ocr: { text: 'B', confidence: 'high', warnings: [] },
      highConfidenceIssues: [{ field: 'processMethod', existingValue: 'Washed', ocrValue: 'Natural', kind: 'mismatch' }],
      fillCandidates: [],
    },
    {
      id: 'fill-2',
      title: 'Fill Second',
      status: 'ACTIVE',
      sourceItemId: '3',
      sourceSkuId: null,
      productUrl: null,
      imageUrl: null,
      ocr: { text: 'C', confidence: 'high', warnings: [] },
      highConfidenceIssues: [],
      fillCandidates: [{ field: 'roastLevel', existingValue: null, ocrValue: 'Medium', kind: 'missing_in_db' }],
    },
    {
      id: 'hard-2',
      title: 'Hard Second',
      status: 'ACTIVE',
      sourceItemId: '4',
      sourceSkuId: null,
      productUrl: null,
      imageUrl: null,
      ocr: { text: 'D', confidence: 'high', warnings: [] },
      highConfidenceIssues: [{ field: 'originCountry', existingValue: 'Kenya', ocrValue: 'Ethiopia', kind: 'mismatch' }],
      fillCandidates: [],
    },
  ];

  const sorted = sortReviewItems(items);

  assert.deepEqual(
    sorted.map((item) => item.id),
    ['hard-1', 'hard-2', 'fill-1', 'fill-2']
  );
});
