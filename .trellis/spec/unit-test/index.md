# Unit Test Guidelines

> 当前自动化测试主要集中在 `apps/api` 与 `apps/miniprogram`，其余部分以类型检查和手动 smoke 为主。

---

## Current Test Surface

| Area | Current State | Primary Command |
|------|---------------|-----------------|
| `apps/api/tests/**/*.test.ts` | 已接入 `node:test` | `pnpm --filter @coffeeatlas/api test` |
| `packages/*` | 暂无独立 test runner | `pnpm typecheck` + 按需补测试 |
| `apps/miniprogram` | 暂无自动化测试框架 | `pnpm --filter @coffeeatlas/miniprogram typecheck` + 微信开发者工具手测 |
| API end-to-end smoke | 通过脚本验证 | `cd apps/api && API_BASE_URL=... pnpm smoke:api` |

---

## Read Next

- [Test Conventions](./conventions.md) - 测试文件写法、断言习惯、何时必须补测试

---

## Pre-Development Checklist

- 改纯函数 / 参数解析 helper -> 先看 `conventions.md`
- 改 API contract / auth helper -> 先看 `conventions.md`，并准备 smoke/手测
- 只改文案或静态样式 -> 通常不需要新增单测，但仍需跑相关 typecheck / 手测
