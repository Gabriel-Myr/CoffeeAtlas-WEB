# Frontend Development Guidelines

> 适用于 `apps/miniprogram`。默认把这里当成当前任务主规范；只有在联动 API、shared-types 或 `apps/api` 后端时，再补读其他 package 的 spec。

---

## Miniprogram Surface In This Repo

### Miniprogram (`apps/miniprogram`)
- Taro 3.x + React 18
- 页面状态、storage、收藏、onboarding、目录检索与登录态接口都已落地
- 目录数据（豆单、discover、烘焙商详情）默认走 `src/services/catalog-supabase.ts`
- 登录、收藏、`/api/v1/health` 等用户态接口仍通过 `src/services/api.ts`
- 运行时 API 地址通过 `src/utils/api-config.ts` 管理；仅对仍走 `/api/v1/*` 的请求生效
- 目录数据依赖编译时 Supabase 环境变量：`TARO_APP_SUPABASE_URL`、`TARO_APP_SUPABASE_ANON_KEY`

---

## Guidelines Index

| Guide | Focus | Status |
|-------|-------|--------|
| [Directory Structure](./directory-structure.md) | 页面、组件、服务层、共享包的落点 | Active |
| [Component Guidelines](./component-guidelines.md) | Taro 页面与组件写法、职责边界 | Active |
| [Hook Guidelines](./hook-guidelines.md) | Taro 生命周期、分页、并发请求、防抖 | Active |
| [State Management](./state-management.md) | 页面状态、跨页入口状态、storage 持久化 | Active |
| [Quality Guidelines](./quality-guidelines.md) | 验证命令、手测重点、禁用模式 | Active |
| [Type Safety](./type-safety.md) | shared-types、本地 types、边界映射 | Active |

补充阅读：
- `../../frontend-architecture.md` - 多端架构视角
- `../../project-overview.md` - 仓库级总览
- `../../guides/cross-layer-thinking-guide.md` - 当任务联动 API / shared-types 时使用

---

## Pre-Development Checklist

按任务类型读取：

- 改页面布局、卡片、筛选条、空态，或用 `Stitch MCP` 出页面稿 -> `component-guidelines.md` + `quality-guidelines.md`
- 改 discover、分页、tab 切换、首页入口状态 -> `hook-guidelines.md` + `state-management.md`
- 改接口字段、props、storage shape、本地 DTO -> `type-safety.md`
- 改目录、抽模块、判断逻辑该不该进 `packages/*` -> `directory-structure.md`

---

## Current Repo Reality

- `@coffee-atlas/shared-types` 仍是 v1 API 主契约层。
- `apps/miniprogram/src/types/index.ts` 主要作为 shared-types 的本地别名出口，并保留少量小程序专用类型。
- `src/services/api.ts` 当前是“用户态接口入口”，不是目录数据的唯一入口。
- 目录数据读取要求 Supabase 环境变量就绪；当前目录页不再回退到 API 联调地址。
- `@coffee-atlas/domain` 已承载收藏快照与部分本地 mapper，storage helper 和页面会直接复用。
- `src/services/api.ts` 已经在用 `@coffee-atlas/api-client` 的 unwrap / error helper，但还不是完整跨端 client 方案。
- `src/utils/storage.ts` 已承载 token、用户、收藏、pending favorites、onboarding profile 等持久化状态。
- 如果改动同时影响 `/api/v1/*`、`packages/shared-types` 或 `apps/api` server mapping，再补读 `.trellis/spec/api/backend/` 与 `.trellis/spec/guides/`。
