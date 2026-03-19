# P1 Catalog Split Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts` 拆成 focused module，并保留 `catalog.ts` 作为兼容入口，降低 God file 维护成本。

**Architecture:** 新增 `catalog-types.ts`、`catalog-core.ts`、`catalog-beans.ts`、`catalog-roasters.ts` 承接公开类型、mapper、sample fallback、beans 查询、roaster 聚合等实现；`catalog.ts` 只保留类型和公开函数 re-export。调用方暂不改 import，优先保证行为不变。

**Tech Stack:** Next.js 16, TypeScript, node:test, pnpm workspace, Supabase

---

### Task 1: 先给 catalog 拆分补兼容与纯逻辑护栏

**Files:**
- Create: `apps/web/tests/catalog-core.test.ts`
- Create: `apps/web/tests/catalog-exports.test.ts`
- Create: `apps/web/tests/catalog-contract.typecheck.ts`
- Read: `apps/web/lib/catalog.ts`
- Read: `apps/web/tests/**/*.test.ts`

- [ ] **Step 1: 给未来的共享纯逻辑模块写失败测试**

优先覆盖：
- `mapCoffeeBean`
- `mapRoaster`
- `getSampleBeans`

要求：
- 用固定 fixture
- 不连接数据库
- 锁定 sample fallback 至少只返回 `ACTIVE` 数据

- [ ] **Step 2: 给 `catalog.ts` 写兼容导出测试**

要求：
- 锁定公开导出仍然存在：
  - `getCatalogBeans`
  - `getCatalogBeansPage`
  - `countCatalogBeans`
  - `getBeanById`
  - `getCatalogBeansByIds`
  - `searchCatalogBeans`
  - `countSearchCatalogBeans`
  - `getRoasterPage`
  - `getRoasters`
  - `countRoasters`
  - `getRoasterById`
  - `getRoastersByIds`
- 不把断言绑定到具体子模块路径

- [ ] **Step 3: 运行测试，确认红灯锁住的是新边界**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: FAIL，且失败集中在新的 catalog 模块不存在或未导出

Run: `pnpm --filter @coffeeatlas/web typecheck`
Expected: PASS，`catalog-contract.typecheck.ts` 作为现有 facade 契约护栏应当先成立

### Task 2: 先抽公共类型到 `catalog-types.ts`

**Files:**
- Create: `apps/web/lib/catalog-types.ts`
- Modify: `apps/web/lib/catalog.ts`
- Test: `apps/web/tests/catalog-contract.typecheck.ts`

- [ ] **Step 1: 把 facade 公开类型搬到 `catalog-types.ts`**

迁移：
- `CoffeeBean`
- `Roaster`
- `CatalogBeanFilters`
- `CatalogBeansQuery`
- `RoastersQuery`

- [ ] **Step 2: 让 `catalog.ts` 只 re-export 这些类型**

要求：
- 新模块不再需要反向 import `catalog.ts`
- 现有消费者 import `@/lib/catalog` 不需要改

- [ ] **Step 3: 让 `catalog-contract.typecheck.ts` 变绿**

Run: `pnpm --filter @coffeeatlas/web typecheck`
Expected: 与 catalog 公共类型相关的 typecheck 通过

### Task 3: 抽离共享 mapper / sample fallback 到 `catalog-core.ts`

**Files:**
- Create: `apps/web/lib/catalog-core.ts`
- Modify: `apps/web/lib/catalog.ts`
- Test: `apps/web/tests/catalog-core.test.ts`

- [ ] **Step 1: 在 `catalog-core.ts` 定义内部 row / aggregate type 和共享 helper**

新增并组织：
- `RoasterBeanRow`
- `RoasterRow`
- `BeanRow`
- `SearchCatalogRow`
- `RoasterAggregateRow`
- `RoasterAggregate`
- `toNumber`
- `normalizeOptionalString`
- `createCatalogError`

- [ ] **Step 2: 迁移 mapper 和 sample fallback**

迁移：
- `mapCoffeeBean`
- `mapRoaster`
- `mapSampleCatalogRow`
- `getSampleBeans`

- [ ] **Step 3: 让 `catalog-core.test.ts` 变绿**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: `catalog-core.test.ts` PASS

### Task 4: 抽离 beans 查询 / 搜索到 `catalog-beans.ts`

**Files:**
- Create: `apps/web/lib/catalog-beans.ts`
- Modify: `apps/web/lib/catalog.ts`
- Test: `apps/web/tests/catalog-exports.test.ts`

- [ ] **Step 1: 迁移 beans 私有 helper**

迁移：
- `resolveBeanIdsForFilters`
- `fetchBeanContext`

- [ ] **Step 2: 迁移 beans 公开函数**

迁移：
- `getCatalogBeans`
- `getCatalogBeansPage`
- `countCatalogBeans`
- `getBeanById`
- `getCatalogBeansByIds`
- `searchCatalogBeans`
- `countSearchCatalogBeans`

要求：
- Supabase 优先、sample fallback 逻辑保持不变
- 继续复用 `catalog-core.ts`

- [ ] **Step 3: 让 `catalog.ts` 转发 beans 公开导出**

示意：

```ts
export {
  getCatalogBeans,
  getCatalogBeansPage,
  countCatalogBeans,
  getBeanById,
  getCatalogBeansByIds,
  searchCatalogBeans,
  countSearchCatalogBeans,
} from './catalog-beans';
```

- [ ] **Step 4: 跑 Web 测试，确认 beans 拆分后仍通过**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: PASS

### Task 5: 抽离 roasters 查询 / 聚合到 `catalog-roasters.ts`

**Files:**
- Create: `apps/web/lib/catalog-roasters.ts`
- Modify: `apps/web/lib/catalog.ts`
- Test: `apps/web/tests/catalog-exports.test.ts`

- [ ] **Step 1: 迁移 roaster 私有 helper**

迁移：
- `createEmptyRoasterAggregate`
- `isTaobaoUrl`
- `isXiaohongshuUrl`
- `fetchRoasterAggregates`
- `matchesRoasterFeature`
- `queryRoasterRows`
- `resolveRoasterCollection`

- [ ] **Step 2: 迁移 roaster 公开函数**

迁移：
- `getRoasterPage`
- `getRoasters`
- `countRoasters`
- `getRoasterById`
- `getRoastersByIds`

- [ ] **Step 3: 让 `catalog.ts` 转发 roaster 公开导出并保留类型出口**

要求：
- `CoffeeBean`、`Roaster`、query/filter type 仍可从 `catalog.ts` 导入
- `catalog.ts` 不保留大段实现

- [ ] **Step 4: 核对调用方面无需改 import 即可继续工作**

重点关注：
- `apps/web/lib/server/public-api.ts`
- `apps/web/lib/server/public-beans.ts`
- `apps/web/lib/server/public-bean-discover.ts`
- `apps/web/lib/server/favorites-api.ts`
- `apps/web/lib/server/new-arrival-filters-service.ts`
- `apps/web/app/HomePageClient.tsx`
- `apps/web/app/all-beans/AllBeansClient.tsx`
- `apps/web/components/atlas/OriginAtlasExplorer.tsx`

- [ ] **Step 5: 跑 Web 全量验证**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/web typecheck`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/web lint`
Expected: PASS with existing `<img>` warnings only

### Task 6: 跑 workspace 回归并完成双阶段审查

**Files:**
- Review: `apps/web/lib/catalog.ts`
- Review: `apps/web/lib/catalog-core.ts`
- Review: `apps/web/lib/catalog-beans.ts`
- Review: `apps/web/lib/catalog-roasters.ts`
- Review: `apps/web/tests/catalog-core.test.ts`
- Review: `apps/web/tests/catalog-exports.test.ts`

- [ ] **Step 1: 跑 workspace 回归**

Run: `pnpm -w typecheck`
Expected: PASS

Run: `pnpm -w lint`
Expected: PASS with existing Web `<img>` warnings only

- [ ] **Step 2: 完成 spec review**

检查点：
- `catalog.ts` 是否已收敛成兼容门面
- sample fallback 是否保留
- beans / roasters / search 对外行为是否保持不变

- [ ] **Step 3: 完成 code quality review**

检查点：
- 是否存在循环依赖
- 是否引入新的重复 helper
- 测试是否锁契约而不是绑定内部路径
