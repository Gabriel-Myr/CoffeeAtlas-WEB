# Frontend Development Guidelines

> 适用于 `apps/web` 和 `apps/miniprogram`。这里记录的是当前仓库真实前端约定，不是初始化模板。

---

## Frontend Surface In This Repo

### Web (`apps/web`)
- Next.js 16 App Router
- 公开页面 + legacy API + `/api/v1/*`
- 主要交互页面：`app/HomePageClient.tsx`、`app/all-beans/AllBeansClient.tsx`
- Atlas UI 组件：`components/atlas/*`

### Miniprogram (`apps/miniprogram`)
- Taro 3.x + React 18
- 页面、组件、storage、auth、API 调用均已落地
- 运行时 API 地址可通过 `src/utils/api-config.ts` 覆盖

---

## Guidelines Index

| Guide | Focus | Status |
|-------|-------|--------|
| [Directory Structure](./directory-structure.md) | 页面、组件、server helper、共享包放哪 | Active |
| [Component Guidelines](./component-guidelines.md) | Web / Taro 组件模式 | Active |
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

- 改页面 / 组件布局 -> `component-guidelines.md` + `quality-guidelines.md`
- 改搜索、分页、discover、加载逻辑 -> `hook-guidelines.md` + `state-management.md`
- 改 DTO、props、API 响应映射 -> `type-safety.md`
- 改目录结构、挪代码、抽共享模块 -> `directory-structure.md`

---

## Current Repo Reality

- `apps/web/app/api/v1/**` 已存在，不能再写成“待开发”。
- `@coffee-atlas/shared-types` 是当前 v1 API 的主契约层。
- `apps/miniprogram/src/types/index.ts` 仍保留一份本地镜像类型；改 v1 契约时必须同步，直到它被 shared-types 彻底接管。
- `packages/api-client` 和 `packages/domain` 还没有成为主运行时路径；不要假设新增逻辑自动复用到两端。
- web 首页和 all-beans 仍有内联 `BeanCard` 组件，这属于当前现实；是否抽离需要看任务范围，不要在无关任务里顺手大改。
