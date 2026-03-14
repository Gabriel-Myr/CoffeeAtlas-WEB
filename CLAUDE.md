# CoffeeAtlas-Web

## 变更记录 (Changelog)

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-03-14 | v1.0 | 初次生成，基于 Monorepo 迁移后状态扫描 |

---

## 项目愿景

CoffeeAtlas 是一个精品咖啡豆目录平台，帮助用户探索全球咖啡产区、烘焙商和豆款。
当前正在从单体 Next.js 应用迁移为 Turborepo Monorepo，目标是同时支持 Web 端和微信小程序（Taro）。

---

## 架构总览

- 构建工具：Turborepo + pnpm workspaces
- 包管理：pnpm 9.x（Node >= 18）
- 语言：TypeScript 5.8（strict 模式）
- 数据库：Supabase（PostgreSQL），含全文搜索（tsvector + pg_trgm）
- Web 框架：Next.js 16（App Router）
- 小程序框架：Taro 3.x（规划中，尚未初始化）
- 样式：Tailwind CSS v4

依赖关系：`apps/web` 和未来的 `apps/miniprogram` 均依赖 `packages/*` 中的共享包。
共享包禁止引入 `next/*` 或 `@tarojs/*`，保持平台无关。

---

## 模块结构图

```mermaid
graph TD
    Root["(根) CoffeeAtlas-Web"] --> Apps["apps/"]
    Root --> Packages["packages/"]
    Apps --> Web["web (Next.js 16)"]
    Apps --> Mini["miniprogram (Taro, 规划中)"]
    Packages --> SharedTypes["shared-types"]
    Packages --> Domain["domain"]
    Packages --> ApiClient["api-client"]
    Web --> SharedTypes
    Web --> Domain
    Web --> ApiClient
    Mini --> SharedTypes
    Mini --> Domain
    Mini --> ApiClient

    click Web "./apps/web/CLAUDE.md" "查看 web 模块文档"
    click SharedTypes "./packages/shared-types/CLAUDE.md" "查看 shared-types 模块文档"
    click Domain "./packages/domain/CLAUDE.md" "查看 domain 模块文档"
    click ApiClient "./packages/api-client/CLAUDE.md" "查看 api-client 模块文档"
```

---

## 模块索引

| 模块 | 路径 | 语言 | 职责 |
|------|------|------|------|
| web | `apps/web` | TypeScript / React | Next.js Web 应用，含 API 网关和前端页面 |
| shared-types | `packages/shared-types` | TypeScript | API DTO、响应信封、查询参数类型定义 |
| domain | `packages/domain` | TypeScript | 纯领域逻辑（映射、校验），当前为骨架 |
| api-client | `packages/api-client` | TypeScript | 跨平台 fetch 客户端，供 Web CSR 和 Taro 使用 |
| miniprogram | `apps/miniprogram` | TypeScript | 微信小程序（Taro），尚未初始化 |

---

## 运行与开发

```bash
# 安装依赖（根目录）
pnpm install

# 全量开发（所有 apps 并行）
pnpm dev

# 仅启动 web
cd apps/web && pnpm dev

# 构建所有包（按依赖顺序）
pnpm build

# 类型检查
pnpm typecheck

# Lint
pnpm lint
```

环境变量（`apps/web/.env.local`）：

| 变量 | 说明 | 是否必须 |
|------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL | 是 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 匿名 Key（浏览器端） | 是 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端 Key（服务端专用） | 推荐 |

未配置 Supabase 时，应用自动降级为 `lib/sample-data.ts` 中的静态数据。

数据库初始化顺序（Supabase SQL Editor）：
1. `db/sql/001_extensions.sql`
2. `db/sql/010_schema.sql`
3. `db/sql/020_indexes.sql`
4. `db/sql/030_rls.sql`
5. `db/sql/040_views_and_functions.sql`
6. `db/sql/050_seed_minimal.sql`（可选）

---

## 测试策略

- `apps/web` 配置了 Node.js 原生测试运行器（`node --test --experimental-strip-types`）
- 测试文件约定：`tests/**/*.test.ts`
- 当前测试目录尚未创建，为主要缺口
- 共享包（`packages/*`）暂无测试配置

---

## 编码规范

- TypeScript strict 模式，所有包继承 `tsconfig.base.json`
- 共享包不得引入 `next/*`、`@tarojs/*` 或任何平台特定依赖
- API 响应统一使用 `{ ok: true, data, meta }` / `{ ok: false, error, meta }` 信封格式
- 数据库字段命名：snake_case；TypeScript 接口命名：camelCase
- 销量数字支持"万"单位解析（`lib/sales.ts`）

---

## AI 使用指引

- 修改 `packages/*` 时，确保不引入平台特定依赖
- `apps/web/lib/catalog.ts` 是核心数据访问层，修改前需理解 Supabase 降级逻辑
- `apps/web/lib/server/` 下的文件仅在服务端运行，不可在客户端组件中直接 import
- 新增 API 路由应放在 `apps/web/app/api/v1/` 下，遵循 `lib/server/api-helpers.ts` 的响应格式
- `domain` 包当前为骨架（大部分文件仅含 `export {}`），填充时遵循 `shared-types` 的类型定义
- 微信小程序接入计划见 `.claude/plan/wechat-miniprogram.md`
