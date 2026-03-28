# Frontend Development Guidelines

> 适用于 `apps/miniprogram`。默认把这里当成当前任务主规范；只有在联动 API、shared-types 或 `apps/api` 后端时，再补读其他 package 的 spec。

---

## Miniprogram Surface In This Repo

### Miniprogram (`apps/miniprogram`)
- Taro 3.x + React 18
- 页面状态、storage、收藏、onboarding、API 联调入口都已落地
- 运行时 API 地址通过 `src/utils/api-config.ts` 管理
- 主请求入口仍是 `src/services/api.ts`

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
- `apps/miniprogram/src/types/index.ts` 仍保留一份本地镜像类型；改 v1 契约时要同步检查。
- `src/services/api.ts` 已经在用 `@coffee-atlas/api-client` 的 path builder / unwrap helper，但还不是完整跨端 client 方案。
- `src/utils/storage.ts` 已承载 token、用户、收藏、pending favorites、onboarding profile 等持久化状态。
- 如果改动同时影响 `/api/v1/*`、`packages/shared-types` 或 `apps/api` server mapping，再补读 `.trellis/spec/api/backend/` 与 `.trellis/spec/guides/`。
