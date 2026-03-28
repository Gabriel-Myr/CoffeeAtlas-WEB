# P1 Public API Beans Split Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `/Users/gabi/CoffeeAtlas-Web/apps/api/lib/server/public-api.ts` 里的 beans/discover 公开读取逻辑拆出去，先缓解 God file 问题，同时保持现有 API 行为不变。

**Architecture:** 这轮只拆 beans 相关逻辑，不动 `/Users/gabi/CoffeeAtlas-Web/apps/api/lib/catalog.ts`，也不改 roasters 对外行为。新增 focused server modules 承接 beans 列表/明细和 discover 逻辑，`/Users/gabi/CoffeeAtlas-Web/apps/api/lib/server/public-api.ts` 保留 roasters 逻辑并转发 beans 导出，避免路由 import 大改。

**Tech Stack:** Next.js 16, TypeScript, node:test, pnpm workspace

---

### Task 1: 先用失败测试锁定“新模块 + 关键纯逻辑”契约

**Files:**
- Create: `apps/api/tests/public-beans.test.ts`
- Create: `apps/api/tests/public-bean-discover.test.ts`
- Read: `apps/api/lib/server/public-api.ts`
- Read: `apps/api/tests/**/*.test.ts`

- [ ] **Step 1: 先给未来的新模块写失败测试，而不是给现有 `public-api.ts` 写“天然就会绿”的测试**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  mapBeanCard,
  mapBeanDetail,
} from '../lib/server/public-beans.ts';

test('mapBeanCard keeps catalog card contract stable', () => {
  assert.deepEqual(mapBeanCard(beanFixture), expectedCard);
});
```

- [ ] **Step 2: 在 `public-bean-discover.test.ts` 里锁定 discover 纯逻辑的稳定输出**

优先覆盖：
- `buildProcessOptions`
- `buildContinentOptions`
- `buildCountryOptions`
- `buildEditorialReason`

要求：
- 用固定 fixture，避免依赖数据库
- 锁定排序、计数、文案分支

- [ ] **Step 3: 运行新测试，确认在新模块还不存在前先失败**

Run: `pnpm --filter @coffeeatlas/api test`
Expected: FAIL，且失败集中在：
- `../lib/server/public-beans.ts`
- `../lib/server/public-bean-discover.ts`

- [ ] **Step 4: 确认红灯确实锁住了本轮新边界，而不是已有代码误报**

记录：
- 哪些测试因为“文件不存在”失败
- 哪些测试在实现后要变成行为护栏

### Task 2: 抽离 beans 列表/明细公共逻辑

**Files:**
- Create: `apps/api/lib/server/public-beans.ts`
- Modify: `apps/api/lib/server/public-api.ts`
- Test: `apps/api/tests/public-beans.test.ts`

- [ ] **Step 1: 在新文件里定义 beans 过滤类型和 mapper 边界**

新增并组织：
- `BeanListFilters`
- `mapBeanCard`
- `mapBeanDetail`
- `normalizeBeanSort`

- [ ] **Step 2: 先让 `public-beans.test.ts` 变绿，只实现 mapper 和最小导出**

Run: `pnpm --filter @coffeeatlas/api test`
Expected: `public-beans.test.ts` PASS，其余测试保持原状

- [ ] **Step 3: 把 beans 列表查询/本地 fallback helper 挪到 `public-beans.ts`**

迁移这些纯/半纯 helper：
- `queryBeanIdsFromView`
- `countBeanIdsFromView`
- `matchesBeanFilters`
- `sortBeans`
- `loadLocalBeans`

- [ ] **Step 4: 在 `public-beans.ts` 实现 `listBeansV1` 和 `getBeanDetailV1`**

要求：
- 入参和返回值保持不变
- 继续复用 `catalog.ts`
- 继续保留 Supabase / local fallback 双路径

- [ ] **Step 5: 让 `public-api.ts` 转发 beans 导出，不修改 route import**

示意：

```ts
export { listBeansV1, getBeanDetailV1 } from './public-beans';
```

- [ ] **Step 6: 跑 Web 测试，确认 beans 基础拆分后仍然通过**

Run: `pnpm --filter @coffeeatlas/api test`
Expected: PASS

### Task 3: 抽离 discover/editorial/fallback 逻辑

**Files:**
- Create: `apps/api/lib/server/public-bean-discover.ts`
- Modify: `apps/api/lib/server/public-api.ts`
- Modify: `apps/api/lib/server/public-beans.ts`
- Test: `apps/api/tests/public-bean-discover.test.ts`

- [ ] **Step 1: 在 discover 模块里搬运 rows/options/editorial 相关 helper**

迁移这些 helper：
- `queryDiscoverRows`
- `mapDiscoverRowsFromBeans`
- `buildProcessOptions`
- `buildContinentOptions`
- `buildCountryOptions`
- `getEditorialConfig`
- `scoreEditorialPick`
- `buildEditorialReason`
- `buildEditorialPicks`
- `buildEditorialPicksFallback`
- `buildDiscoverFallbackPayload`

- [ ] **Step 2: 先在测试里锁定 discover 服务层的主路径/fallback 行为，而不直接碰数据库**

为未来的新模块设计一个最小可测 seam，例如：
- `getBeanDiscoverPayloadWithDeps(...)`
- 或 `createBeanDiscoverService(deps)`

测试至少覆盖：
- 主路径成功时，返回稳定的 `BeanDiscoverPayload`
- 主路径抛错时，走 fallback payload
- 无 Supabase 时，仍返回稳定 payload

要求：
- 用 stub deps，不连数据库
- 锁定 fallback 触发条件和最终 payload 结构

- [ ] **Step 3: 先让 `public-bean-discover.test.ts` 变绿，只实现纯逻辑 helper 和服务层 seam**

Run: `pnpm --filter @coffeeatlas/api test`
Expected: `public-bean-discover.test.ts` PASS，且不需要数据库

- [ ] **Step 4: 让 discover 模块只依赖 `public-beans.ts` 的最小必要导出**

要求：
- 不反向 import `public-api.ts`
- 避免循环依赖
- 如果 discover 需要 beans mapper/filter helper，就从 `public-beans.ts` 明确导出

- [ ] **Step 5: 在 `public-bean-discover.ts` 实现 `getBeanDiscoverV1`**

保持：
- 主路径优先 Supabase
- 失败后 fallback payload
- editorial config / picks 逻辑不变
- service 层通过测试 seam 锁住 fallback 行为，不靠手工比对猜测

- [ ] **Step 6: 让 `public-api.ts` 转发 `getBeanDiscoverV1`**

示意：

```ts
export { getBeanDiscoverV1 } from './public-bean-discover';
```

- [ ] **Step 7: 跑 Web 测试，确认 discover 拆分后仍然通过**

Run: `pnpm --filter @coffeeatlas/api test`
Expected: PASS

### Task 4: 用兼容测试和搬运清单收口 `public-api.ts`

**Files:**
- Modify: `apps/api/lib/server/public-api.ts`
- Create: `apps/api/tests/public-api-beans.test.ts`
- Test: `apps/api/tests/**/*.test.ts`

- [ ] **Step 1: 新增兼容测试，锁定 `public-api.ts` 仍然导出 beans 公共入口**

```ts
import {
  listBeansV1,
  getBeanDetailV1,
  getBeanDiscoverV1,
} from '../lib/server/public-api.ts';

test('public-api keeps bean exports after split', () => {
  assert.equal(typeof listBeansV1, 'function');
  assert.equal(typeof getBeanDetailV1, 'function');
  assert.equal(typeof getBeanDiscoverV1, 'function');
});
```

- [ ] **Step 2: 清掉 `public-api.ts` 中已迁出的 beans/discover 内联实现**

保留：
- roasters 相关实现
- beans/discover 的 re-export

- [ ] **Step 3: 按函数清单核对“只搬运不改逻辑”**

核对清单：
- `mapBeanCard`
- `mapBeanDetail`
- `queryBeanIdsFromView`
- `countBeanIdsFromView`
- `queryDiscoverRows`
- `matchesBeanFilters`
- `loadLocalBeans`
- `buildEditorialPicks`
- `buildDiscoverFallbackPayload`
- `listBeansV1`
- `getBeanDiscoverV1`
- `getBeanDetailV1`

要求：
- 每个函数只能处于一个最终实现位置
- 入参/返回值不变
- 关键分支条件不变

- [ ] **Step 4: 检查 route 侧是否无需改 import 即可继续工作**

关注：
- `apps/api/app/api/beans/route.ts`
- `apps/api/app/api/beans/[id]/route.ts`
- `apps/api/app/api/v1/beans/route.ts`
- `apps/api/app/api/v1/beans/[id]/route.ts`
- `apps/api/app/api/v1/beans/discover/route.ts`

- [ ] **Step 5: 跑 Web 全量验证**

Run: `pnpm --filter @coffeeatlas/api test`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/api typecheck`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/api lint`
Expected: PASS with existing `<img>` warnings only

- [ ] **Step 6: 跑 workspace 回归验证**

Run: `pnpm -w typecheck`
Expected: PASS

Run: `pnpm -w lint`
Expected: PASS with existing Web `<img>` warnings only

- [ ] **Step 7: 完成子代理审查**

要求：
- 规格审查 1 次
- 代码质量审查 1 次
- 若有阻塞问题，先修再复审
