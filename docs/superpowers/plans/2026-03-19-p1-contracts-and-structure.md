# P1 Contracts And Structure Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 收紧 shared-types 契约、让空壳 package 至少变成真实入口、并抽掉 beans 路由里的重复参数解析。

**Architecture:** 这一轮不拆巨型文件，也不改页面行为，先修“契约边界”和“假分层”。共享 DTO 以 `@coffee-atlas/shared-types` 为唯一边界来源；`packages/api-client` 和 `packages/domain` 只补最小可信入口；路由解析逻辑下沉到 Web server helper，避免 legacy/v1 双份复制。

**Tech Stack:** pnpm workspace, TypeScript, Next.js 16, Taro, node:test

---

### Task 1: 收敛共享类型

**Files:**
- Modify: `packages/shared-types/src/catalog/index.ts`
- Modify: `packages/shared-types/src/common/index.ts`
- Modify: `packages/shared-types/src/index.ts`
- Modify: `apps/miniprogram/src/types/index.ts`
- Modify: `apps/api/lib/catalog.ts`
- Modify: `apps/api/app/all-beans/AllBeansClient.tsx`
- Test: `apps/miniprogram/tests/new-arrival-filters.test.ts`
- Test: `apps/api/tests/**/*.test.ts`

- [ ] **Step 1: 先写/补测试，锁定共享 CoffeeBean 契约被 web 和 miniprogram 共同消费**
- [ ] **Step 2: 跑对应测试，确认在改类型前会因重复定义或不一致暴露问题**
- [ ] **Step 3: 把 `CoffeeBean`、分页信封、健康检查等共享边界类型收回 `packages/shared-types`**
- [ ] **Step 4: 让 Web 和 miniprogram 改为 import 共享类型，删除本地重复定义**
- [ ] **Step 5: 跑 typecheck 和相关测试，确认跨端未破**

### Task 2: 让空壳 packages 变成真实入口

**Files:**
- Modify: `packages/domain/src/catalog.ts`
- Modify: `packages/domain/src/roasters.ts`
- Modify: `packages/domain/src/mappers.ts`
- Modify: `packages/domain/src/index.ts`
- Modify: `packages/api-client/src/beans.ts`
- Modify: `packages/api-client/src/errors.ts`
- Modify: `packages/api-client/src/index.ts`
- Modify: `apps/miniprogram/src/services/api.ts`
- Test: `packages/api-client/src/**/*.ts` via typecheck
- Test: `apps/miniprogram/tests/new-arrival-filters.test.ts`

- [ ] **Step 1: 先确定这轮只做“最小可信实现”，不硬迁运行时**
- [ ] **Step 2: 给 `api-client` 提供真实 beans 请求 helper 和统一错误解析工具**
- [ ] **Step 3: 给 `domain` 提供纯平台无关的 catalog/roaster mapper 或 re-export type helpers，去掉 `export {}`**
- [ ] **Step 4: 在一个真实消费者里接入最小使用点，证明 package 不是摆设**
- [ ] **Step 5: 跑 typecheck 和受影响测试，确认入口有效**

### Task 3: 抽出 beans 路由公共解析逻辑

**Files:**
- Create: `apps/api/lib/server/bean-query-params.ts`
- Modify: `apps/api/app/api/beans/route.ts`
- Modify: `apps/api/app/api/v1/beans/route.ts`
- Test: `apps/api/tests/bean-query-params.test.ts`

- [ ] **Step 1: 先写失败测试，锁定 `parseSort` / `parseContinent` / `parseBooleanFlag` 的期望行为**
- [ ] **Step 2: 运行新测试，确认在 helper 还没抽出前失败**
- [ ] **Step 3: 新建公共 helper，统一 beans 查询参数解析**
- [ ] **Step 4: 两个 route 都改用共享 helper，保持各自响应格式不变**
- [ ] **Step 5: 跑 Web test、lint、typecheck，确认重构无回归**
