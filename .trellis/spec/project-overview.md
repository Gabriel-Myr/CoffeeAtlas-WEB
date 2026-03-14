# 项目概述

## 项目信息

- **项目名称**: CoffeeAtlas / CoffeeStories WebDB
- **定位**: 咖啡豆和烘焙商的数据平台
- **架构**: Monorepo（pnpm workspace + Turborepo）
- **技术栈**: Next.js 16 + React 19 + Taro 3.x + Supabase + Tailwind CSS 4 + TypeScript

## 核心功能

### 1. 公开目录展示
- **首页** (`/`): 地图式咖啡豆浏览，按大洲分类展示
- **完整目录** (`/all-beans`): 可搜索、可筛选的咖啡豆列表
- 支持多主题切换（温暖奶咖、深色咖啡馆、清新绿茶等）

### 2. 微信小程序
- 基于 Taro 3.x 构建，支持微信小程序和 H5
- 通过 Next.js API Routes 中间层访问数据

### 3. 数据导入系统
- 支持从 Excel/CSV 导入咖啡豆数据
- 自动关联烘焙商和咖啡豆
- 销量数据同步

### 4. 数据库架构
- 基于 Supabase (PostgreSQL)
- 核心表：roasters（烘焙商）、beans（咖啡豆）、roaster_beans（关联表）
- 支持全文搜索、RLS 权限控制

## 项目结构（Monorepo）

```
CoffeeAtlas-Web/
├── apps/
│   ├── web/              # Next.js Web 应用
│   │   ├── app/          # App Router 页面
│   │   ├── components/   # Web 专用组件
│   │   ├── lib/          # 工具库（supabase、catalog 等）
│   │   └── scripts/      # 数据导入脚本
│   └── miniprogram/      # Taro 小程序
│       ├── src/          # 小程序源码
│       └── config/       # Taro 编译配置
├── packages/
│   ├── shared-types/     # 共享 TypeScript 类型（API 响应、分页等）
│   ├── api-client/       # 小程序用 API 客户端
│   └── domain/           # 领域逻辑（catalog、roasters、mappers）
├── pnpm-workspace.yaml   # pnpm workspace 配置
└── turbo.json            # Turborepo 任务配置
```

## 包依赖关系

```
apps/web          → packages/shared-types（可选）
apps/miniprogram  → packages/api-client → packages/shared-types
                  → packages/domain
packages/domain   → packages/shared-types
```

## 开发环境

- Node.js 18+
- pnpm 8+（包管理器）
- Supabase 项目（需要配置环境变量）

## 快速开始

```bash
# 安装所有依赖
pnpm install

# 启动 Web 开发服务器
pnpm --filter coffeestories-webdb dev

# 启动小程序开发（微信）
pnpm --filter @coffeeatlas/miniprogram dev:weapp

# 全量构建
pnpm turbo build

# 全量类型检查
pnpm turbo typecheck
```

## 数据库初始化

按顺序在 Supabase SQL Editor 中执行（位于 `apps/web/db/sql/`）：
1. `001_extensions.sql`
2. `010_schema.sql`
3. `020_indexes.sql`
4. `030_rls.sql`
5. `040_views_and_functions.sql`
6. `050_seed_minimal.sql`（可选）
