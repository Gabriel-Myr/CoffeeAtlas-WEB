# Miniprogram All Beans Entry Unification Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让冷启动的 `新手` 和 `有一点经验` 都进入同一个 `all-beans` 页面，并统一为单一发现流。

**Architecture:** 保留现有 `guided / direct` 入口语义，用它控制同一张引导卡的默认展开状态。`all-beans` 页面去掉顶部 `tab` 和 `销量 / 新品` 浏览骨架，只保留发现流；新品接口与筛选辅助逻辑继续保留，供后续迁移复用。

**Tech Stack:** Taro 3.x, React 18, TypeScript, Node test runner

---

### Task 1: 更新入口流测试

**Files:**
- Modify: `apps/miniprogram/tests/onboarding-logic.test.ts`
- Modify: `apps/miniprogram/tests/onboarding-navigation.test.ts`
- Modify: `apps/miniprogram/tests/onboarding-copy.test.ts`

- [ ] 先改测试，定义 `intermediate` 也进入 `/pages/all-beans/index`
- [ ] 运行相关测试，确认先失败
- [ ] 最小修改 onboarding 逻辑与文案
- [ ] 再跑测试确认通过

### Task 2: 收敛 all-beans 入口状态

**Files:**
- Modify: `apps/miniprogram/tests/all-beans-route-params.test.ts`
- Modify: `apps/miniprogram/tests/all-beans-entry-transition.test.ts`
- Modify: `apps/miniprogram/tests/all-beans-discover-guidance.test.ts`
- Modify: `apps/miniprogram/tests/guided-discover.test.ts`
- Modify: `apps/miniprogram/src/pages/all-beans/route-params.ts`
- Modify: `apps/miniprogram/src/pages/all-beans/entry-transition.ts`
- Modify: `apps/miniprogram/src/pages/all-beans/discover-guidance.ts`
- Modify: `apps/miniprogram/src/pages/all-beans/guided-discover.ts`

- [ ] 先把旧的 `tab` 相关测试改成“单页发现流”预期
- [ ] 运行测试确认失败
- [ ] 删除 `tab` 相关状态解析与手动切换逻辑
- [ ] 保留 `guided / direct / default` 三种落地语义
- [ ] 运行测试确认通过

### Task 3: 改 all-beans 页面骨架

**Files:**
- Modify: `apps/miniprogram/src/pages/all-beans/index.tsx`
- Delete: `apps/miniprogram/src/pages/all-beans/tab-visibility.ts`
- Delete: `apps/miniprogram/tests/all-beans-tab-visibility.test.ts`

- [ ] 去掉顶部 `tab` 和 `销量 / 新品` 页面主流程
- [ ] 把轻问答卡片改为所有人可见、按入口默认展开或收起
- [ ] 保留发现页现有筛选与结果流
- [ ] 保留新品接口辅助代码，不在当前页面展示

### Task 4: 验证

**Files:**
- Verify only

- [ ] 运行小程序相关测试
- [ ] 运行 `pnpm --filter @coffeeatlas/miniprogram typecheck`
- [ ] 检查 diff，确认没有把新品接口代码误删
