# P2 Beans Search Consistency Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 统一 beans 搜索“列表结果”和“total 计数”的语义，避免同一搜索词下两边命中规则不一致。

**Architecture:** 以 `apps/web/lib/catalog-beans.ts` 为收口点，把 beans 搜索的列表与计数建立在同一套搜索规则上。这轮明确以现有 `public.search_catalog(...)` 的命中规则为准，为计数新增独立的 count RPC，但不改现有 `search_catalog` 的签名或返回结构。测试不依赖真实 Supabase，而是通过抽取最小 helper 和可控 stub 覆盖“Supabase 搜索分支”的行为。

**Tech Stack:** Next.js 16, TypeScript, node:test, Supabase RPC/view, pnpm workspace

---

### Task 1: 给 beans 搜索一致性补失败测试

**Files:**
- Modify: `apps/web/tests/catalog-query.test.ts`
- Modify or Create: `apps/web/tests/catalog-search.test.ts`
- Read: `apps/web/lib/catalog-beans.ts`
- Read: `apps/web/db/sql/040_views_and_functions.sql`
- Read: `apps/web/db/migrations/*.sql`

- [ ] **Step 1: 写失败测试锁定 beans 搜索列表/计数应共享同一语义边界**

覆盖：
- “sanitize 后为空”的 query，列表和计数都退化为普通列表/普通计数
- Supabase 搜索分支下，同一 query 的列表和计数都对齐 `search_catalog` 语义
- sample fallback 下也保持同一判断边界

要求：
- 不访问真实 Supabase
- 通过抽 helper / stub RPC 结果的方式，稳定覆盖 Supabase 分支

- [ ] **Step 2: 运行 Web 测试确认红灯**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: FAIL，且失败集中在 beans search helper 或 catalog-beans 接线

### Task 2: 在 catalog-beans 内统一搜索列表与计数实现

**Files:**
- Modify: `apps/web/lib/catalog-beans.ts`
- Modify or Create: `apps/web/lib/catalog-query.ts`
- Modify: `apps/web/db/sql/040_views_and_functions.sql`
- Create: `apps/web/db/migrations/004_search_catalog_count.sql`
- Modify: `apps/web/db/setup.sql`
- Test: `apps/web/tests/catalog-query.test.ts`
- Test: `apps/web/tests/catalog-search.test.ts`

- [ ] **Step 1: 抽最小 helper，统一搜索 query 的归一化与空查询判定**

要求：
- 列表和计数使用同一个“query 是否有效”的判定
- 不改 `searchCatalogBeans()` / `countSearchCatalogBeans()` 的外部签名
- 不破坏 sample fallback

- [ ] **Step 2: 以 `search_catalog` 为准统一 Supabase 路径语义**

实现方向：
- 新增 `public.search_catalog_count(p_query text)` 或等价 count RPC
- `searchCatalogBeans()` 继续走现有 `search_catalog`
- `countSearchCatalogBeans()` 改为走新的 count RPC

约束：
- 不修改现有 `public.search_catalog(...)` 的签名、参数名、返回列
- 只新增 count 入口，不把列表降级回 `v_catalog_active + ilike/or`
- `search_catalog_count` 必须复用与 `search_catalog` 相同的 `where` 条件：`ACTIVE`、`is_public`、`tsquery` 命中、`similarity` 阈值等
- 同步更新 `apps/web/db/setup.sql`，避免 migration / setup 漂移

要求：
- 避免同一 query 在列表和 total 上出现明显分叉
- 最小必要改动，不重写整套搜索系统

- [ ] **Step 3: 跑 Web 回归**

Run: `pnpm --filter @coffeeatlas/web test`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/web typecheck`
Expected: PASS

### Task 3: 跑 workspace 验证并完成双阶段审查

**Files:**
- Review: `apps/web/lib/catalog-beans.ts`
- Review: `apps/web/lib/catalog-query.ts`
- Review: `apps/web/tests/catalog-query.test.ts`
- Review: `apps/web/tests/catalog-search.test.ts`

- [ ] **Step 1: 跑 workspace 回归**

Run: `pnpm -w typecheck`
Expected: PASS

Run: `pnpm -w lint`
Expected: PASS with existing `<img>` warnings only

- [ ] **Step 2: 做 spec review**

重点：
- 列表和计数是否共享同一搜索语义
- 空查询 / sanitize 后为空 的退化是否一致
- 现有 `public.search_catalog(...)` 的签名/返回结构是否保持不变
- facade 和上层 public-api contract 是否保持兼容

- [ ] **Step 3: 做 code quality review**

重点：
- 是否引入新的 search duplication
- helper 边界是否清楚
- 测试是否锁行为而不是锁实现细节
