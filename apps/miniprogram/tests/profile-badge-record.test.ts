import assert from 'node:assert/strict';
import test from 'node:test';

import { getBadgeRecordCopy } from '../src/pages/profile/badge-record.ts';

test('getBadgeRecordCopy returns login prompt copy for guests', () => {
  assert.deepEqual(getBadgeRecordCopy({ loggedIn: false, totalSaved: 0 }), {
    eyebrow: 'BADGE RECORD',
    title: '徽章记录',
    description: '登录后，你的收藏、浏览和探索会逐步点亮这里的徽章。',
    hint: '先登录，后面再慢慢收集。',
  });
});

test('getBadgeRecordCopy returns progress copy for logged-in users', () => {
  assert.deepEqual(getBadgeRecordCopy({ loggedIn: true, totalSaved: 3 }), {
    eyebrow: 'BADGE RECORD',
    title: '徽章记录',
    description: '你的徽章位已经准备好，继续收藏和浏览，记录会慢慢变丰富。',
    hint: '当前已沉淀 3 条足迹，后续会在这里解锁展示。',
  });
});
