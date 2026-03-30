import assert from 'node:assert/strict';
import test from 'node:test';

import { getProfileBadges } from '../src/pages/profile/profile-badges.ts';

test('getProfileBadges keeps all badges locked for guests', () => {
  const badges = getProfileBadges({
    loggedIn: false,
    beanFavorites: 0,
    roasterFavorites: 0,
    historyCount: 0,
  });

  assert.equal(badges.length, 6);
  assert.equal(badges.every((badge) => badge.unlocked === false), true);

  const loginBadge = badges.find((badge) => badge.id === 'visitor');
  assert.ok(loginBadge);
  assert.equal(loginBadge.detail, '登录后即可解锁这枚徽章。');
});

test('getProfileBadges unlocks the login badge for signed-in users', () => {
  const badges = getProfileBadges({
    loggedIn: true,
    beanFavorites: 0,
    roasterFavorites: 0,
    historyCount: 0,
  });

  const loginBadge = badges.find((badge) => badge.id === 'visitor');
  assert.ok(loginBadge);
  assert.equal(loginBadge.unlocked, true);
  assert.equal(loginBadge.progressLabel, '已完成');
});

test('getProfileBadges unlocks bean collection badges at the right thresholds', () => {
  const badges = getProfileBadges({
    loggedIn: true,
    beanFavorites: 5,
    roasterFavorites: 0,
    historyCount: 0,
  });

  const beanStarter = badges.find((badge) => badge.id === 'bean-starter');
  const beanCollector = badges.find((badge) => badge.id === 'bean-collector');

  assert.ok(beanStarter);
  assert.ok(beanCollector);
  assert.equal(beanStarter.unlocked, true);
  assert.equal(beanCollector.unlocked, true);
});

test('getProfileBadges computes remaining progress for locked badges', () => {
  const badges = getProfileBadges({
    loggedIn: true,
    beanFavorites: 3,
    roasterFavorites: 0,
    historyCount: 4,
  });

  const beanCollector = badges.find((badge) => badge.id === 'bean-collector');
  const historyRegular = badges.find((badge) => badge.id === 'history-regular');

  assert.ok(beanCollector);
  assert.ok(historyRegular);
  assert.equal(beanCollector.unlocked, false);
  assert.equal(beanCollector.remainingValue, 2);
  assert.equal(beanCollector.detail, '再收藏 2 款豆子可解锁。');
  assert.equal(historyRegular.unlocked, false);
  assert.equal(historyRegular.detail, '再浏览 6 条记录可解锁。');
});

test('getProfileBadges unlocks roaster and history badges independently', () => {
  const badges = getProfileBadges({
    loggedIn: true,
    beanFavorites: 1,
    roasterFavorites: 1,
    historyCount: 10,
  });

  const roasterBadge = badges.find((badge) => badge.id === 'roaster-radar');
  const historyExplorer = badges.find((badge) => badge.id === 'history-explorer');
  const historyRegular = badges.find((badge) => badge.id === 'history-regular');

  assert.ok(roasterBadge);
  assert.ok(historyExplorer);
  assert.ok(historyRegular);
  assert.equal(roasterBadge.unlocked, true);
  assert.equal(historyExplorer.unlocked, true);
  assert.equal(historyRegular.unlocked, true);
});
