# 前端架构规范

## 多端架构概览

```
apps/web (Next.js)          apps/miniprogram (Taro)
      │                              │
      │ SSR + API Routes             │ 调用 /api/v1/*
      ▼                              ▼
Supabase ◄──────── Next.js API Routes (/api/v1/*)
                          │
                   packages/domain
                   packages/shared-types
```

---

## Web 端（apps/web）

### 技术栈

- **框架**: Next.js 16 (App Router)
- **React**: 19.0.0
- **样式**: Tailwind CSS 4.2.1
- **动画**: Framer Motion (motion 12.34.3)
- **图标**: lucide-react
- **TypeScript**: 5.8.2（严格模式）

### App Router 结构

```
apps/web/app/
├── page.tsx                    # 首页（服务端组件）
├── HomePageClient.tsx          # 首页客户端组件
├── layout.tsx                  # 根布局
├── globals.css                 # 全局样式
├── all-beans/
│   ├── page.tsx               # 完整目录页面
│   └── AllBeansClient.tsx     # 目录客户端组件
└── api/
    └── v1/                    # 小程序用 API（v1）【待开发】
        ├── beans/route.ts
        ├── beans/[id]/route.ts
        ├── roasters/route.ts
        ├── roasters/[id]/route.ts
        ├── auth/wechat/login/route.ts
        └── me/favorites/route.ts
```

## 组件模式

### 服务端组件 vs 客户端组件

**服务端组件**（默认）：
- 用于静态内容、数据获取
- 可以直接访问数据库（通过 `supabaseServer`）
- 示例：`apps/web/app/page.tsx`

```tsx
import HomePageClient from './HomePageClient';
import { getCatalogBeans } from '@/lib/catalog';

export default async function HomePage() {
  const beans = await getCatalogBeans(100);
  return <HomePageClient initialBeans={beans} />;
}
```

**客户端组件**（需要 `'use client'`）：
- 用于交互、状态管理、动画
- 不能直接访问数据库，需通过 API 路由
- 示例：`apps/web/app/HomePageClient.tsx`

```tsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function HomePageClient({ initialBeans }) {
  const [searchQuery, setSearchQuery] = useState('');
}
```

## 主题系统

5 种预设主题，通过 CSS 变量 + `data-theme` 属性切换：

```typescript
type ThemeOption = 'warm' | 'dark' | 'green' | 'minimal' | 'japanese';
```

## 路径别名

```json
{ "paths": { "@/*": ["./*"] } }
```

## 状态管理

- **本地状态**: `useState`
- **URL 状态**: Next.js `useSearchParams`
- **服务端状态**: props 传递初始数据，客户端按需刷新

## 动画规范

使用 Framer Motion：

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
/>
```

---

## 小程序端（apps/miniprogram）

### 技术栈

- **框架**: Taro 3.6.30
- **React**: 18（Taro 内置）
- **样式**: SCSS（rpx 单位）
- **TypeScript**: 严格模式

### 目录结构

```
apps/miniprogram/src/
├── app.tsx              # 小程序入口
├── app.config.ts        # 全局配置（页面路由）
├── app.scss             # 全局样式（CSS 变量 + 动画）
├── pages/
│   ├── index/           # 首页（大洲/产区地图 + 豆款列表）
│   ├── all-beans/       # 全部咖啡豆（分页 + 搜索）
│   ├── bean-detail/     # 豆款详情
│   ├── roasters/        # 烘焙商列表
│   ├── roaster-detail/  # 烘焙商详情
│   └── profile/         # 个人中心（登录 + 收藏）
├── components/
│   ├── BeanCard/        # 咖啡豆卡片
│   ├── RoasterCard/     # 烘焙商卡片
│   ├── SearchBar/       # 搜索框
│   ├── FilterBar/       # 筛选栏
│   ├── EmptyState/      # 空状态占位
│   └── Icon/            # 图标组件
├── services/
│   └── api.ts           # API 客户端（直接调用 /api/v1/*）
├── types/
│   └── index.ts         # 类型定义（CoffeeBean、RoasterSummary 等）
└── utils/
    ├── storage.ts       # Taro.Storage 封装（token、收藏、历史）
    ├── auth.ts          # 微信登录 + 收藏同步
    └── formatters.ts    # 数字格式化（万/K）
```

### 数据获取

小程序直接使用 `src/services/api.ts`，不经过 `packages/api-client`：

```typescript
// src/services/api.ts
import Taro from '@tarojs/taro';
import { getToken } from '../utils/storage';

const BASE_URL = process.env.TARO_APP_API_URL || '';

async function request<T>(endpoint: string, options?): Promise<T> {
  const token = getToken();
  const res = await Taro.request({
    url: `${BASE_URL}${endpoint}`,
    header: token ? { Authorization: `Bearer ${token}` } : {},
    ...options,
  });
  const body = res.data as V1Response<T>;
  if (body.ok) return body.data;
  throw new Error(body.error?.message || '请求失败');
}
```

### 样式规范

全局 CSS 变量定义在 `app.scss`，与 web 端 `globals.css` 对齐：

```scss
:root {
  --color-coffee-dark: #3E2A1E;
  --color-coffee-light: #8B7355;
  --color-bg-warm: #f5f0e8;
  --color-bg-cream: #fdfaf4;
  --color-card-bg: #ffffff;
  --color-accent-rust: #c85c3d;
  --color-border: rgba(107, 83, 68, 0.15);
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.03);
}
```

动画使用 CSS keyframes（替代 web 端的 Framer Motion）：
- `.animate-fade-in-up` / `.animate-scale-in` / `.animate-fade-in`
- `.animate-delay-1` ~ `.animate-delay-5`（步进 0.05s）

### 编译命令

```bash
pnpm --filter @coffeeatlas/miniprogram dev:weapp   # 微信小程序开发
pnpm --filter @coffeeatlas/miniprogram dev:h5       # H5 开发
pnpm --filter @coffeeatlas/miniprogram build:weapp  # 生产构建
```

### 环境变量

```bash
# apps/miniprogram/.env（开发，填局域网 IP）
TARO_APP_API_URL=http://192.168.x.x:3000

# apps/miniprogram/.env.production
TARO_APP_API_URL=https://your-domain.com
```
