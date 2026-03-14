# Directory Structure

> 本项目是 Monorepo，前端分为两个 app：`apps/web`（Next.js）和 `apps/miniprogram`（Taro）。

---

## Web 端（apps/web）

```
apps/web/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 根布局
│   ├── globals.css             # 全局样式（CSS 变量 + Tailwind）
│   ├── page.tsx                # 首页（服务端组件）
│   ├── HomePageClient.tsx      # 首页客户端组件
│   ├── all-beans/
│   │   ├── page.tsx
│   │   └── AllBeansClient.tsx
│   └── api/v1/                 # 小程序 API 路由【待开发】
├── components/                 # Web 专用组件
├── lib/                        # 工具库
│   ├── catalog.ts              # 核心数据访问层（Supabase 查询）
│   ├── supabase.ts             # Supabase 客户端（browser + server）
│   ├── types.ts                # 数据库实体类型
│   ├── sales.ts                # 销量格式化
│   └── server/                 # 仅服务端使用的模块
│       └── api-helpers.ts      # API 响应格式化工具
└── db/sql/                     # 数据库迁移 SQL
```

## 小程序端（apps/miniprogram）

```
apps/miniprogram/src/
├── app.tsx / app.config.ts / app.scss
├── pages/
│   ├── index/          # 首页
│   ├── all-beans/      # 全部咖啡豆
│   ├── bean-detail/    # 豆款详情
│   ├── roasters/       # 烘焙商列表
│   ├── roaster-detail/ # 烘焙商详情
│   └── profile/        # 个人中心
├── components/         # 小程序专用组件（每个组件一个目录）
│   └── BeanCard/
│       ├── index.tsx
│       └── index.scss
├── services/
│   └── api.ts          # 唯一 API 入口
├── types/
│   └── index.ts        # 所有类型定义
└── utils/
    ├── storage.ts
    ├── auth.ts
    └── formatters.ts
```

## 共享包（packages/）

```
packages/
├── shared-types/       # API DTO、响应信封、分页类型
├── domain/             # 纯领域逻辑（骨架，待填充）
└── api-client/         # 跨平台 fetch 客户端（骨架，待填充）
```

**规则**：`packages/*` 禁止引入 `next/*` 或 `@tarojs/*`。

## 命名约定

| 类型 | 规则 | 示例 |
|------|------|------|
| 页面文件 | `index.tsx` | `pages/bean-detail/index.tsx` |
| 客户端组件 | `*Client.tsx` | `HomePageClient.tsx` |
| 组件目录 | PascalCase | `components/BeanCard/` |
| 工具函数 | camelCase | `formatSalesCount` |
| 类型接口 | PascalCase | `CoffeeBean`, `RoasterDetail` |
