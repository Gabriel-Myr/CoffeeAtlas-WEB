# P2 Search SQL Dedup Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `search_catalog` 和 `search_catalog_count` 的重复搜索匹配 SQL 收成单一内部入口，降低列表/计数语义再次漂移的风险。

**Architecture:** 在数据库层新增一个内部共享的搜索匹配函数，统一承载公开可见性、全文搜索和相似度匹配规则。`search_catalog` 继续负责分页与排序，`search_catalog_count` 只负责计数，两者都改为委托给共享 helper。Web 层行为应保持不变，现有搜索一致性回归必须继续通过。

**Tech Stack:** PostgreSQL / Supabase SQL, TypeScript, node:test, pnpm workspace

---

### Task 1: 先补结构防漂移测试

**Files:**
- Create: `apps/api/tests/catalog-search-sql.test.ts`
- Read: `apps/api/db/sql/040_views_and_functions.sql`
- Read: `apps/api/db/setup.sql`
- Read: `apps/api/db/migrations/004_search_catalog_count.sql`
- Read: `apps/api/db/migrations/005_search_catalog_matches_helper.sql`

- [ ] **Step 1: 写失败测试，锁定 SQL 必须通过共享 helper 收口**

覆盖：
- `040_views_and_functions.sql` 中存在共享 helper，例如 `search_catalog_matches`
- `search_catalog(...)` 委托给共享 helper，而不是自己再写一份匹配条件
- `search_catalog_count(...)` 委托给共享 helper，而不是自己再写一份匹配条件
- `setup.sql` 也定义同样的共享 helper 和委托关系
- 新增 migration 也必须定义同样的共享 helper 和委托关系，避免 baseline SQL 与 migration 漂移

- [ ] **Step 2: 运行 Web 测试确认红灯**

Run: `pnpm --filter @coffeeatlas/api test`
Expected: FAIL，失败集中在新加的 SQL 结构测试

### Task 2: 重构 SQL 到单一共享 helper

**Files:**
- Modify: `apps/api/db/sql/040_views_and_functions.sql`
- Modify: `apps/api/db/setup.sql`
- Create: `apps/api/db/migrations/005_search_catalog_matches_helper.sql`
- Test: `apps/api/tests/catalog-search-sql.test.ts`
- Test: `apps/api/tests/catalog-search.test.ts`

- [ ] **Step 1: 新增共享 helper 函数，承载统一搜索匹配逻辑**

要求：
- helper 承载：
  - 公开可见性边界
  - `tsquery` 匹配
  - `similarity` 阈值
  - `updated_at`
  - `rank_score`
- 空查询也通过 helper 返回公开 catalog 结果集
- helper 为内部复用服务，不对现有 Web 调用面暴露新契约要求

- [ ] **Step 2: 让 `search_catalog` 和 `search_catalog_count` 都委托给 helper**

要求：
- `search_catalog(...)` 签名、参数名、返回列保持不变
- `search_catalog_count(...)` 签名保持不变
- 不改历史 migration `004_search_catalog_count.sql`
- 用新 migration 追加这次 SQL 重构

- [ ] **Step 3: 跑 Web 回归**

Run: `pnpm --filter @coffeeatlas/api test`
Expected: PASS

Run: `pnpm --filter @coffeeatlas/api typecheck`
Expected: PASS

### Task 3: 做 workspace 验证和双阶段审查

**Files:**
- Review: `apps/api/db/sql/040_views_and_functions.sql`
- Review: `apps/api/db/setup.sql`
- Review: `apps/api/db/migrations/005_search_catalog_matches_helper.sql`
- Review: `apps/api/tests/catalog-search-sql.test.ts`

- [ ] **Step 1: 跑 workspace 验证**

Run: `pnpm -w typecheck`
Expected: PASS

Run: `pnpm -w lint`
Expected: PASS with existing `<img>` warnings only

- [ ] **Step 2: 做 spec review**

重点：
- SQL 匹配逻辑是否真正收口到单一 helper
- `search_catalog` / `search_catalog_count` 外部契约是否保持稳定
- 是否遵守“新增增量 migration，不改历史 migration”约束
- Web 侧现有行为是否保持兼容

- [ ] **Step 3: 做 code quality review**

重点：
- 是否还保留新的搜索重复逻辑
- SQL helper 边界是否清晰
- 测试是否真的能防止将来再次漂移
