# P1 Catalog Query Hardening Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 收紧 `catalog` 剩余的高价值历史债：优化 roaster 列表的主分页路径，并把 beans/roasters 搜索输入清洗收回到 catalog 内部。

**Architecture:** 保留 `catalog.ts` facade 不动，在 `catalog-beans.ts` / `catalog-roasters.ts` 内补内部 query helper。`roaster` 先优化最常用的“无 feature 过滤”路径：直接分页查 roasters + 独立计数 + 仅对当前页聚合；`feature` 过滤暂时保留现有全量路径。搜索输入清洗抽到纯 helper，并由 catalog 内部自保，不再依赖上层 caller 先清洗。

**Tech Stack:** Next.js 16, TypeScript, node:test, Supabase, pnpm workspace

---

### Task 1: 给 catalog query sanitize 补纯 helper 和失败测试

**Files:**
- Create: `apps/web/tests/catalog-query.test.ts`
- Create or Modify: `apps/web/lib/catalog-query.ts`
- Modify: `apps/web/lib/catalog-beans.ts`
- Modify: `apps/web/lib/catalog-roasters.ts`

- [ ] **Step 1: 写失败测试锁定 catalog 内部的 query sanitize 行为**

覆盖：
- `% , ( )` 这类 PostgREST/Supabase `.or/.ilike` 易出问题字符会被去掉或替换，但保留 `'` 以避免破坏名称语义
- 空白和空字符串会归一到 `undefined`
- wildcard 构造后的值适合 `ilike/or` 使用

- [ ] **Step 2: 运行单测确认先红**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: FAIL，且失败集中在新的 catalog query helper 或其调用点

- [ ] **Step 3: 实现最小 helper 并接到 beans / roasters 查询里**

要求：
- `searchCatalogBeans()` / `countSearchCatalogBeans()` 自己 sanitize，不信任 caller
- `queryRoasterRows()` 自己 sanitize，不信任 caller
- 保持外部 API contract 不变

- [ ] **Step 4: 跑 Web 测试与 typecheck**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/web typecheck`
Expected: PASS

### Task 2: 优化 roaster 列表的无 feature 主分页路径

**Files:**
- Modify: `apps/web/lib/catalog-roasters.ts`
- Test: `apps/web/tests/catalog-query.test.ts`
- Review: `apps/web/lib/server/public-api.ts`

- [ ] **Step 1: 先补失败测试，锁定新的分页路径行为**

优先锁定纯逻辑/可观察行为：
- 无 `feature` 过滤时，分页参数会在 roaster 基础查询层生效
- total 通过独立 count 计算，不依赖先把全部 rows 拉回再 `slice`
- 有 `feature` 时暂时保留现有 collection 路径

- [ ] **Step 2: 跑测试确认红灯是主路径还没优化**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: FAIL，且失败集中在 roaster path selection / query helper

- [ ] **Step 3: 实现最小改动的双路径查询**

要求：
- 无 `feature`：分页 select + exact count + 当前页 aggregate hydration
- 有 `feature`：保留 `resolveRoasterCollection()` 慢路径，避免扩大改动面
- no-supabase sample fallback 保持不变
- 不改 `public-api.ts` 的调用 contract

- [ ] **Step 4: 跑 Web 回归**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/web typecheck`
Expected: PASS

### Task 3: 跑 workspace 验证并做双阶段审查

**Files:**
- Review: `apps/web/lib/catalog-query.ts`
- Review: `apps/web/lib/catalog-beans.ts`
- Review: `apps/web/lib/catalog-roasters.ts`
- Review: `apps/web/tests/catalog-query.test.ts`

- [ ] **Step 1: 跑 workspace 回归**

Run: `pnpm -w typecheck`
Expected: PASS

Run: `pnpm -w lint`
Expected: PASS with existing `<img>` warnings only

- [ ] **Step 2: 做 spec review**

重点：
- catalog 内部自保 sanitize 是否生效
- roaster 无 feature 主路径是否不再全量取再 slice
- facade 和 public-api contract 是否保持兼容

- [ ] **Step 3: 做 code quality review**

重点：
- 是否引入新的 query duplication
- feature 慢路径与主路径边界是否清楚
- 测试是否锁行为而不是锁实现细节
