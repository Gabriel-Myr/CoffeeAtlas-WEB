# 项目概述

## 项目信息

- **项目名称**: CoffeeAtlas / CoffeeStories WebDB
- **定位**: 精品咖啡豆、烘焙商与产地探索平台
- **架构**: Monorepo（pnpm workspace + Turborepo）
- **技术栈**: Next.js 16 + React 19 + Taro 3.x + Supabase + Tailwind CSS 4 + TypeScript

## 核心能力

### 1. Web 公开目录
- 首页 `apps/web/app/page.tsx` + `HomePageClient.tsx`
- 全部豆款页 `apps/web/app/all-beans/page.tsx`
- Atlas 风格产地探索组件：`apps/web/components/atlas/*`

### 2. v1 API
- 主 API 位于 `apps/web/app/api/v1/**`
- 使用统一响应信封：`{ ok, data|error, meta }`
- 涵盖 beans、roasters、health、me、favorites、wechat login

### 3. 微信小程序
- `apps/miniprogram` 已经存在，不再是“规划中”目录
- 页面、组件、API client、storage/auth 工具已接入当前代码库
- 运行时通过 `src/utils/api-config.ts` 支持覆盖 API 基地址

### 4. 数据访问与导入
- `apps/web/lib/catalog.ts` 负责公开目录读取和 sample fallback
- `apps/web/lib/server/*` 负责服务端 API 组装、鉴权、收藏等逻辑
- `apps/web/scripts/import-*.ts` 负责导入
- `apps/web/db/sql/**` + `apps/web/db/migrations/**` 管理 schema 与增量变更

## Monorepo 结构

```
CoffeeAtlas-Web/
├── apps/
│   ├── web/
│   └── miniprogram/
├── packages/
│   ├── shared-types/
│   ├── api-client/
│   └── domain/
├── .trellis/
├── pnpm-workspace.yaml
└── turbo.json
```

## 包职责

- `apps/web` -> Web UI、Next.js API、Supabase server access
- `apps/miniprogram` -> Taro 小程序 UI 和本地 API client
- `packages/shared-types` -> 当前权威 API 契约层
- `packages/api-client` -> 预备中的跨端 client，当前未完全接管运行时
- `packages/domain` -> 预备中的纯领域逻辑层，当前内容较少

## 开发环境

- Node.js `>=20.9.0`
- pnpm `>=9.0.0`
- 可选 Supabase / WeChat 环境变量

## 快速开始

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm --filter coffeestories-webdb test
```

## 环境变量

### Web / server
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_JWT_SECRET`
- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`

### Miniprogram
- `TARO_APP_API_URL`

## 重要现实约束

- `apps/web/app/api/beans` 和 `apps/web/app/api/roasters` 仍是 legacy 兼容层。
- v1 契约以 `packages/shared-types` 为准，小程序本地类型需保持同步。
- 公开 catalog 读取允许 sample fallback；写接口、鉴权、收藏不允许假写入。
