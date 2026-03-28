# Frontend Development Guidelines

> 适用于 `apps/miniprogram`，并补充说明与 `apps/api` 的接口边界。这里记录的是当前仓库真实前端约定，不是初始化模板。

---

## Frontend Surface In This Repo

### Miniprogram (`apps/miniprogram`)
- Taro 3.x + React 18
- 页面、组件、storage、auth、API 调用均已落地
- 运行时 API 地址可通过 `src/utils/api-config.ts` 覆盖

### API Boundary (`apps/api`)
- 提供 `/api/v1/*` 和 legacy `/api/*`
- 承载鉴权、收藏、健康检查、目录 DTO 组装
- 前端只把它当成接口边界，不把 server-only 逻辑直接引到客户端

---

## Guidelines Index

| Guide | Focus | Status |
|-------|-------|--------|
| [Directory Structure](./directory-structure.md) | 页面、组件、server helper、共享包放哪 | Active |
| [Component Guidelines](./component-guidelines.md) | Taro 组件模式与设计稿落地约束 | Active |
| [Hook Guidelines](./hook-guidelines.md) | React hooks、Taro 生命周期、加载节奏 | Active |
| [State Management](./state-management.md) | 本地状态、storage、URL / runtime config | Active |
| [Quality Guidelines](./quality-guidelines.md) | 命令、禁用模式、手测和 smoke | Active |
| [Type Safety](./type-safety.md) | shared-types、app local types、边界映射 | Active |

补充阅读：
- `../frontend-architecture.md` - 多端架构视角
- `../project-overview.md` - 仓库级总览
- `../guides/cross-layer-thinking-guide.md` - 跨层数据流检查

---

## Pre-Development Checklist

按任务类型读取：

- 改页面 / 组件布局 / 用 `Stitch MCP` 生成或改稿 -> `component-guidelines.md` + `quality-guidelines.md`
- 改搜索、分页、discover、加载逻辑 -> `hook-guidelines.md` + `state-management.md`
- 改 DTO、props、API 响应映射 -> `type-safety.md`
- 改目录结构、挪代码、抽共享模块 -> `directory-structure.md`

---

## Current Repo Reality

- `apps/api/app/api/v1/**` 已存在，不能再写成“待开发”。
- `@coffee-atlas/shared-types` 是当前 v1 API 的主契约层。
- `apps/miniprogram/src/types/index.ts` 仍保留一份本地镜像类型；改 v1 契约时必须同步，直到它被 shared-types 彻底接管。
- `packages/api-client` 和 `packages/domain` 还没有成为主运行时路径；不要假设新增逻辑自动复用到两端。
