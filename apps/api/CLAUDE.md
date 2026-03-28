# apps/api

当前目录是 CoffeeAtlas 的 API-only Next.js 应用。

## 主要职责

- 提供 `app/api/v1/**` 和 legacy `app/api/**` 路由
- 承载 `lib/server/**`、`lib/catalog.ts`、`lib/supabase.ts`
- 管理 `db/sql/**`、`db/migrations/**`
- 提供导入脚本和 `smoke:api`

## 常用命令

```bash
pnpm dev
pnpm typecheck
pnpm test
pnpm smoke:api
```

## 约束

- route handler 保持轻量，复杂逻辑放 `lib/server/**`
- v1 契约优先对齐 `@coffee-atlas/shared-types`
- 读取型目录接口允许 sample fallback；写接口、鉴权、收藏、微信登录不允许静默 fallback
- 目录内可以使用 Next.js / server-only 能力，但不要把这些能力泄漏到 `packages/*`
