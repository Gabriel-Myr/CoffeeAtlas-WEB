# P0 Foundation Repair Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复仓库 P0 工程底座问题，让命名、包管理、忽略规则和 lint 至少先一致且可运行。

**Architecture:** 这轮只做 repo-level 和 app-level 的最小必要修复，不碰业务行为。lint 入口统一到根配置，Web 继续走 Next 规则，其它目录补基础规则，先把“能持续检查”建立起来，再处理更深层的结构债。

**Tech Stack:** pnpm workspace, Turborepo, Next.js 16, ESLint 9, TypeScript

---

### Task 1: 固化对外入口信息

**Files:**
- Modify: `README.md`
- Modify: `apps/api/package.json`
- Modify: `apps/api/app/api/v1/health/route.ts`
- Modify: `apps/api/app/api/health/route.ts`

- [ ] Step 1: 更新 README 为 monorepo 现实，统一使用 pnpm
- [ ] Step 2: 更新 Web 包名与健康检查 service 名称
- [ ] Step 3: 复查是否仍残留 CoffeeStories / coffeestories-webdb 作为对外标识

### Task 2: 修复仓库卫生

**Files:**
- Modify: `.gitignore`
- Delete: `apps/api/package-lock.json`

- [ ] Step 1: 补齐构建产物、缓存、日志、临时文件的忽略规则
- [ ] Step 2: 删除错误的 npm 锁文件
- [ ] Step 3: 复查 `git status --short` 是否还会被这些文件持续污染

### Task 3: 修通 lint 入口

**Files:**
- Create: `eslint.config.mjs`
- Modify: `package.json`
- Modify: `apps/api/package.json`
- Modify: `apps/miniprogram/package.json`
- Modify: `packages/api-client/package.json`
- Modify: `packages/domain/package.json`
- Modify: `packages/shared-types/package.json`

- [ ] Step 1: 先运行 `pnpm -w lint`，确认当前失败点是 Web 的 `next lint`
- [ ] Step 2: 新增根 ESLint 配置，区分 Next/Web 与通用 TS 文件
- [ ] Step 3: 把各包 `lint` 脚本改成真实 lint 命令
- [ ] Step 4: 再跑 `pnpm -w lint`，修到全仓通过

### Task 4: 验证

**Files:**
- No file changes

- [ ] Step 1: 运行 `pnpm -w lint`
- [ ] Step 2: 运行 `pnpm -w typecheck`
- [ ] Step 3: 记录仍未纳入本轮的遗留问题，避免范围失控
