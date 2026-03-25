# Miniprogram Bean Discovery Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把小程序主入口和 discover 主流程改造成清晰的选豆体验，并加入新手 / 熟手分流。

**Architecture:** 复用现有 discover、新品、收藏和 Atlas 能力，不新增后端接口。实现重点放在首页信息架构、discover 交互顺序、本地 onboarding 状态和文案重排；必要时把大页面里的入口解析和 onboarding 逻辑拆成小 helper，避免继续把所有行为堆在页面组件里。

**Tech Stack:** Taro、React、TypeScript、本地 Storage、现有 `/api/v1/beans*` 接口、Node test/typecheck

---

## File Map

- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/utils/storage.ts`
  - 新增 onboarding 状态读写
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/index/index.tsx`
  - 首页改成选豆入口页
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/index/index.scss`
  - 首页新布局样式
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/index/index.config.ts`
  - 导航标题调整
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/all-beans/index.tsx`
  - discover 步骤重排、入口参数解析、分流接入
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/all-beans/index.scss`
  - discover 区块顺序和引导样式调整
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/all-beans/index.config.ts`
  - 导航标题调整
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/components/NewArrivalFilterBar/index.tsx`
  - 新品筛选栏文案优化
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/profile/index.tsx`
  - 增加 onboarding 身份展示与重置入口
- Test: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/tests/new-arrival-filters.test.ts`
  - 确认新品筛选逻辑未回归
- Create: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/tests/onboarding-storage.test.ts`
  - 锁定 onboarding 状态读写
- Create: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/tests/discover-entry.test.ts`
  - 锁定 discover 入口参数解析或初始状态逻辑

### Task 1: Add Onboarding Storage State

**Files:**
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/utils/storage.ts`
- Test: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/tests/onboarding-storage.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clearOnboardingProfile,
  getOnboardingProfile,
  setOnboardingProfile,
} from '../src/utils/storage';

test('onboarding profile round-trips in local storage', () => {
  clearOnboardingProfile();
  assert.equal(getOnboardingProfile(), null);

  setOnboardingProfile({ experienceLevel: 'beginner', completedAt: 123 });
  assert.deepEqual(getOnboardingProfile(), {
    experienceLevel: 'beginner',
    completedAt: 123,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @coffeeatlas/miniprogram test -- onboarding-storage.test.ts`
Expected: FAIL with missing export or missing file

- [ ] **Step 3: Write minimal implementation**

在 `storage.ts` 中新增：

```ts
export type OnboardingExperienceLevel = 'beginner' | 'intermediate';

export interface OnboardingProfile {
  experienceLevel: OnboardingExperienceLevel;
  completedAt: number;
}
```

再补：

- `getOnboardingProfile()`
- `setOnboardingProfile(profile)`
- `clearOnboardingProfile()`

保持实现风格与现有 token / favorites 存储 helper 一致。

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @coffeeatlas/miniprogram test -- onboarding-storage.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/miniprogram/src/utils/storage.ts apps/miniprogram/tests/onboarding-storage.test.ts
git commit -m "feat(miniprogram): add onboarding storage state"
```

### Task 2: Rebuild Home Page As Bean-Selection Entry

**Files:**
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/index/index.tsx`
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/index/index.scss`
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/index/index.config.ts`

- [ ] **Step 1: Write the failing test**

如果首页没有现成测试基础，这一步改为先提炼纯函数，再测它：

Create helper contract in page file or extracted helper:

```ts
function buildHomeEntryActions(profile: OnboardingProfile | null) {
  return {
    primary: 'guided',
    secondary: 'new',
    tertiary: 'direct',
  };
}
```

为它写最小测试，锁定首页始终存在 3 个入口意图。

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @coffeeatlas/miniprogram test -- discover-entry.test.ts`
Expected: FAIL with helper missing

- [ ] **Step 3: Write minimal implementation**

首页改造要求：

- 把现在的地图首屏降为次级模块
- 首屏新增 3 个入口卡片
  - `带我选豆`
  - `最近上新`
  - `我有点了解，直接筛`
- 点击规则：
  - `带我选豆` -> 跳到 `/pages/all-beans/index?entry=guided`
  - `最近上新` -> 跳到 `/pages/all-beans/index?tab=new`
  - `我有点了解，直接筛` -> 跳到 `/pages/all-beans/index?entry=direct`
- 如果已存在 onboarding profile，可在入口文案上做轻微个性化，但不要改变页面结构

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @coffeeatlas/miniprogram test -- discover-entry.test.ts`
Expected: PASS

- [ ] **Step 5: Manually verify page flow**

Run: `pnpm --filter @coffeeatlas/miniprogram typecheck`
Expected: PASS

手动检查：

- 首页打开后，先看到选豆入口，不是大地图
- 三个入口都能正确跳转
- 地图仍然保留在首页下半部分

- [ ] **Step 6: Commit**

```bash
git add apps/miniprogram/src/pages/index/index.tsx apps/miniprogram/src/pages/index/index.scss apps/miniprogram/src/pages/index/index.config.ts
git commit -m "feat(miniprogram): turn home into bean selection entry"
```

### Task 3: Reorder Discover Flow To Origin-First

**Files:**
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/all-beans/index.tsx`
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/all-beans/index.scss`
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/all-beans/index.config.ts`
- Create: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/tests/discover-entry.test.ts`

- [ ] **Step 1: Write the failing test**

提炼 discover 初始化逻辑为纯函数并测试：

```ts
test('guided entry opens discover tab and marks onboarding prompt as needed when profile missing', () => {
  const result = resolveDiscoverEntryState({
    tab: undefined,
    entry: 'guided',
    profile: null,
  });

  assert.deepEqual(result, {
    activeTab: 'discover',
    shouldPromptOnboarding: true,
  });
});
```

再补一个熟手场景：

```ts
test('new tab entry opens new arrivals directly', () => {
  const result = resolveDiscoverEntryState({
    tab: 'new',
    entry: undefined,
    profile: null,
  });

  assert.equal(result.activeTab, 'new');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @coffeeatlas/miniprogram test -- discover-entry.test.ts`
Expected: FAIL with missing helper

- [ ] **Step 3: Write minimal implementation**

在 `all-beans/index.tsx` 里完成 4 件事：

1. 解析首页带来的路由参数
2. 接入 onboarding profile，决定是否在 guided 入口下弹分流
3. 调整 discover 区块顺序：
   - 第一块：大洲
   - 第二块：国家
   - 第三块：处理法
   - 第四块：结果
4. 为每一步补一句简短说明文案

实现时建议提炼纯 helper，避免继续增肥页面：

- `resolveDiscoverEntryState(...)`
- `getDiscoverStepCopy(...)`

同时保留现有：

- `editorPicks`
- 空状态处理
- 结果分页加载
- 搜索与 tab 切换

- [ ] **Step 4: Run focused tests**

Run: `pnpm --filter @coffeeatlas/miniprogram test -- discover-entry.test.ts`
Expected: PASS

- [ ] **Step 5: Run regression checks**

Run: `pnpm --filter @coffeeatlas/miniprogram test -- new-arrival-filters.test.ts`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/miniprogram typecheck`
Expected: PASS

- [ ] **Step 6: Manually verify discover**

手动检查：

- `entry=guided` 时进入 discover
- profile 缺失时会提示选择“新手 / 熟手”
- 选择后会写入 storage
- discover 顺序已变为“大洲 -> 国家 -> 处理法 -> 结果”
- 推荐豆和结果列表仍能正常显示

- [ ] **Step 7: Commit**

```bash
git add apps/miniprogram/src/pages/all-beans/index.tsx apps/miniprogram/src/pages/all-beans/index.scss apps/miniprogram/src/pages/all-beans/index.config.ts apps/miniprogram/tests/discover-entry.test.ts
git commit -m "feat(miniprogram): make discover flow origin first"
```

### Task 4: Polish New Arrivals And Profile Reset

**Files:**
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/components/NewArrivalFilterBar/index.tsx`
- Modify: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/pages/profile/index.tsx`
- Test: `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/tests/new-arrival-filters.test.ts`

- [ ] **Step 1: Write the failing test**

如果组件测试基础不足，这一步保持为逻辑回归测试：

- 先运行 `new-arrival-filters.test.ts`
- 确保本期文案调整不需要改变 payload contract

- [ ] **Step 2: Run existing test baseline**

Run: `pnpm --filter @coffeeatlas/miniprogram test -- new-arrival-filters.test.ts`
Expected: PASS before UI wording changes

- [ ] **Step 3: Write minimal implementation**

在 `NewArrivalFilterBar` 中：

- 标题从“猜你喜欢筛选”改成更明确的文案
- 根据 mode 展示：
  - `基于你的收藏`
  - `收藏方向 + 热门新品`
  - `热门新品`

在 `profile/index.tsx` 中：

- 展示当前 onboarding 身份
- 增加“重新选择选豆方式”入口
- 点击后清空 onboarding profile

- [ ] **Step 4: Run regression checks**

Run: `pnpm --filter @coffeeatlas/miniprogram test -- new-arrival-filters.test.ts`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/miniprogram typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/miniprogram/src/components/NewArrivalFilterBar/index.tsx apps/miniprogram/src/pages/profile/index.tsx
git commit -m "feat(miniprogram): polish onboarding and new arrival messaging"
```

### Task 5: Final Verification

**Files:**
- No new files

- [ ] **Step 1: Run full miniprogram tests**

Run: `pnpm --filter @coffeeatlas/miniprogram test`
Expected: PASS

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @coffeeatlas/miniprogram typecheck`
Expected: PASS

- [ ] **Step 3: Smoke the main paths manually**

检查以下路径：

- 首页 -> 带我选豆 -> onboarding -> discover
- 首页 -> 最近上新 -> new tab
- 首页 -> 直接筛豆 -> discover
- 我的 -> 重置选豆方式 -> 再次进入 guided 流程

- [ ] **Step 4: Commit final integration**

```bash
git add apps/miniprogram
git commit -m "feat(miniprogram): reshape bean discovery journey"
```
