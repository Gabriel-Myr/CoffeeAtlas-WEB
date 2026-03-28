# 开发规范

> 仓库级通用规范。具体到 frontend / backend / test 的实现约束，优先看对应的 Trellis 子目录文档。

---

## Monorepo 基本规则

### 包管理与任务执行

根目录统一使用 pnpm + Turborepo：

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

按包执行时使用 `--filter`：

```bash
pnpm --filter @coffeeatlas/api dev
pnpm --filter @coffeeatlas/api test
pnpm --filter @coffeeatlas/miniprogram typecheck
```

### 当前包职责

| 路径 | 包名 | 职责 |
|------|------|------|
| `apps/api` | `@coffeeatlas/api` | Next API + Supabase server access |
| `apps/miniprogram` | `@coffeeatlas/miniprogram` | Taro 小程序 |
| `packages/shared-types` | `@coffee-atlas/shared-types` | 当前权威 API 契约层 |
| `packages/api-client` | `@coffee-atlas/api-client` | 预备中的跨端 client |
| `packages/domain` | `@coffee-atlas/domain` | 预备中的纯领域逻辑层 |

---

## 代码归属原则

- **API 路由与服务端逻辑** -> `apps/api/app/api/`、`apps/api/lib/server/`
- **公开目录读取与 sample fallback** -> `apps/api/lib/catalog.ts`
- **小程序页面与组件** -> `apps/miniprogram/src/pages/`、`apps/miniprogram/src/components/`
- **小程序 API / storage / auth** -> `apps/miniprogram/src/services/`、`apps/miniprogram/src/utils/`
- **跨层 API DTO / query params** -> `packages/shared-types/src/`
- **真正稳定的跨端逻辑** -> 评估后再进入 `packages/api-client` 或 `packages/domain`

不要因为 `packages/api-client` / `packages/domain` 已存在，就把还没稳定的代码强行迁进去。

---

## 跨包边界

### 允许

```ts
import type { CatalogBeanCard } from '@coffee-atlas/shared-types';
import { apiSuccess } from '@/lib/server/api-helpers';
```

### 不允许

```ts
import { something } from '../../apps/api/lib/catalog';
import { NextRequest } from 'next/server'; // in packages/*
import Taro from '@tarojs/taro'; // in packages/*
```

规则：

- `packages/*` 必须保持平台无关
- api / miniprogram 不直接跨 app 引内部文件
- 跨层契约优先走 `@coffee-atlas/shared-types`

---

## TypeScript 与路径别名

### 共享基础

- 根 `tsconfig.base.json` 提供 `@coffee-atlas/*` 路径映射
- `apps/api/tsconfig.json` 提供 `@/*`
- `apps/miniprogram/tsconfig.json` 提供 `@/* -> src/*`

### 类型要求

- 默认 `strict: true`
- 导出函数和复杂 helper 应明确类型边界
- 尽量避免 `any`
- row shape、内部模型、DTO 要分层，不要混用

---

## 命名规范

- 组件：PascalCase
- route segment：Next.js 下用目录名表达路由，如 `all-beans/page.tsx`
- helper / util：camelCase 导出，文件名通常 kebab-case 或约定俗成
- 常量：`UPPER_SNAKE_CASE`
- 类型 / 接口：PascalCase

---

## 环境变量与敏感信息

### 新代码规则

- 只通过 `process.env.*` 读取敏感配置
- 客户端可见配置必须走 `NEXT_PUBLIC_*` 或 `TARO_APP_*`
- 新增脚本不要再内嵌 key、域名或本地绝对路径

### 当前仓库现实

仓库里仍有历史债务：部分 env 文件和导入脚本带有真实/默认敏感值。Trellis 文档需要记住这个风险，但新代码不能继续复制这种模式。

---

## 路由与服务端逻辑拆分

- route handler 负责：解析请求、鉴权、调用 service、返回响应
- 复杂查询和 DTO 组装放到 `apps/api/lib/server/**` 或 `apps/api/lib/catalog.ts`
- 不要把大段 DB 查询、鉴权、转换逻辑直接堆进 `route.ts`

---

## 验证命令

按改动范围执行：

```bash
pnpm lint
pnpm typecheck
pnpm --filter @coffeeatlas/api test
pnpm --filter @coffeeatlas/miniprogram typecheck
```

API 改动且环境可用时：

```bash
cd apps/api && API_BASE_URL=http://127.0.0.1:3000 pnpm smoke:api
```

---

## Git 与提交

提交信息继续使用约定式风格：

```bash
feat(scope): description
fix(scope): description
docs(scope): description
refactor(scope): description
test(scope): description
chore(scope): description
```

常见 scope：`web`、`miniprogram`、`api`、`packages`、`db`、`trellis`

---

## 文档同步原则

以下变更完成后，应同步 Trellis：

- 新 API 契约
- 新数据访问模式
- 新前端组织方式
- 新测试约定
- 新的 repo 级坑点或技术债边界

目标不是“文档很多”，而是让下一次 AI / 人类进入仓库时读到的是当前现实。
