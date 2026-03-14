# 小程序全量交付计划

## 目标

1. 修复 API 路径不匹配（统一走 `/api/v1/*`，分页参数统一用 `pageSize`）
2. 样式完全还原 web 端（颜色变量、字体大小、卡片布局、CSS 动画替代 framer-motion）
3. 新增烘焙商列表页和详情页
4. 微信登录 + 云端收藏同步

---

## 架构决策

- Next.js API Routes 作为后端边界，Supabase PostgreSQL 作为数据存储
- 应用自签 JWT 作为用户鉴权机制（不使用 Supabase Auth）
- 微信登录：`wx.login()` → `code2Session` → 业务 JWT
- 保留 web 端 legacy `/api/beans`、`/api/roasters` 不删除

---

## 文件变更清单

### 新增：数据库 migration
- `apps/web/db/migrations/0xx_app_users_and_favorites.sql`

### 新增：Web 后端
- `apps/web/lib/server/auth-jwt.ts` — JWT 签发/验证
- `apps/web/lib/server/auth-user.ts` — 当前用户提取
- `apps/web/lib/server/wechat-auth.ts` — code2Session 集成
- `apps/web/lib/server/favorites-api.ts` — 收藏域查询
- `apps/web/app/api/v1/auth/wechat/login/route.ts`
- `apps/web/app/api/v1/me/route.ts`
- `apps/web/app/api/v1/me/favorites/route.ts`
- `apps/web/app/api/v1/me/favorites/sync/route.ts`
- `apps/web/app/api/v1/me/favorites/[targetType]/[targetId]/route.ts`

### 修改：Web 后端
- `apps/web/lib/server/api-primitives.ts` — 分页兼容 `limit` 别名
- `apps/web/lib/server/public-api.ts` — 扩展 roaster DTO 字段
- `apps/web/app/api/v1/beans/route.ts` — 接受 `limit` 别名
- `apps/web/app/api/v1/roasters/route.ts` — 接受 `limit` 别名，扩展字段
- `apps/web/app/api/v1/roasters/[id]/route.ts` — 返回完整 roaster 详情

### 新增：小程序
- `apps/miniprogram/src/pages/roasters/index.config.ts`
- `apps/miniprogram/src/pages/roasters/index.tsx`
- `apps/miniprogram/src/pages/roasters/index.scss`
- `apps/miniprogram/src/pages/roaster-detail/index.config.ts`
- `apps/miniprogram/src/pages/roaster-detail/index.tsx`
- `apps/miniprogram/src/pages/roaster-detail/index.scss`
- `apps/miniprogram/src/utils/auth.ts` — 登录编排、token 持久化
- `apps/miniprogram/src/components/RoasterCard/index.tsx`
- `apps/miniprogram/src/components/RoasterCard/index.scss`

### 修改：小程序
- `apps/miniprogram/src/services/api.ts` — 切换到 `/v1/*`，注入 auth header，新增 roaster/auth/favorites API
- `apps/miniprogram/src/types/index.ts` — 新增 v1 envelope、roaster、auth、favorite 类型
- `apps/miniprogram/src/utils/storage.ts` — 新增 token 存储、收藏同步队列
- `apps/miniprogram/src/app.config.ts` — 注册 roaster 页面，新增 tabBar 烘焙商入口
- `apps/miniprogram/src/app.scss` — 引入 web 设计 token（颜色变量、间距、动画）
- `apps/miniprogram/src/pages/index/index.tsx` — 使用 `pageSize`，v1 响应格式
- `apps/miniprogram/src/pages/index/index.scss` — 对齐 web 样式
- `apps/miniprogram/src/pages/all-beans/index.tsx` — 迁移到 v1 分页
- `apps/miniprogram/src/pages/all-beans/index.scss` — 对齐 web 样式
- `apps/miniprogram/src/pages/bean-detail/index.tsx` — 收藏改为云端同步
- `apps/miniprogram/src/pages/bean-detail/index.scss` — 对齐 web 样式，CSS 动画
- `apps/miniprogram/src/pages/profile/index.tsx` — 微信登录入口，云端收藏
- `apps/miniprogram/src/pages/profile/index.scss` — 对齐 web 样式
- `apps/miniprogram/src/components/BeanCard/index.tsx` — 样式更新
- `apps/miniprogram/src/components/BeanCard/index.scss` — 对齐 web 卡片样式

---

## 实施顺序

### Phase 1：数据库 + JWT 基础（无依赖）
1. 编写 migration SQL（`app_users`、`user_favorites`、索引、RLS）
2. 实现 `auth-jwt.ts`（JWT 签发/验证，secret 来自 `APP_JWT_SECRET`）
3. 实现 `auth-user.ts`（从 Bearer token 提取当前用户）

### Phase 2：后端 Auth + 收藏 API（依赖 Phase 1）
1. 实现 `wechat-auth.ts`（code2Session）
2. 实现 `POST /api/v1/auth/wechat/login`
3. 实现 `GET /api/v1/me`
4. 实现 `favorites-api.ts`（收藏域查询）
5. 实现收藏 CRUD + sync 端点

### Phase 3：后端目录 API 对齐（依赖 Phase 1）
1. `api-primitives.ts` 分页兼容 `limit` 别名
2. 扩展 roaster DTO（补 `logoUrl`、`description`、`websiteUrl`、`instagramHandle`）
3. 验证 legacy 路由不受影响

### Phase 4：小程序服务层迁移（依赖 Phase 2 + Phase 3）
1. 重构 `services/api.ts`：切换到 `/v1/*`，注入 Bearer token，适配 v1 响应格式
2. 更新 `types/index.ts`：v1 envelope、roaster、auth、favorite 类型
3. 更新 `utils/storage.ts`：token 存储、收藏同步队列
4. 实现 `utils/auth.ts`：登录编排

### Phase 5：烘焙商页面（依赖 Phase 3 + Phase 4）
1. 新增 `RoasterCard` 组件
2. 新增烘焙商列表页
3. 新增烘焙商详情页
4. 注册路由，更新 tabBar

### Phase 6：微信登录 + 云端收藏（依赖 Phase 2 + Phase 4）
1. 个人页添加登录入口（未登录状态）
2. 实现 `wx.login()` 流程
3. 豆子详情页收藏改为云端同步（登录后）
4. 首次登录合并本地收藏到云端

### Phase 7：样式还原（依赖 Phase 4 + Phase 5）
1. `app.scss` 引入 web 颜色 token 和间距变量
2. 定义 CSS 动画类（`fade-in-up`、`scale-in`、`stagger-*`）
3. 更新所有页面和组件 SCSS
4. BeanCard、RoasterCard 样式对齐 web 卡片

---

## 数据库 Migration SQL

```sql
begin;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  wechat_openid text not null unique,
  wechat_unionid text,
  nickname text,
  avatar_url text,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  target_type text not null check (target_type in ('bean', 'roaster')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create trigger trg_app_users_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

create trigger trg_user_favorites_updated_at
before update on public.user_favorites
for each row execute function public.set_updated_at();

create index if not exists idx_app_users_openid on public.app_users (wechat_openid);
create index if not exists idx_user_favorites_user_created on public.user_favorites (user_id, created_at desc);
create index if not exists idx_user_favorites_target on public.user_favorites (target_type, target_id);

alter table public.app_users enable row level security;
alter table public.user_favorites enable row level security;

commit;
```

---

## 新增 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/wechat/login` | 微信登录，返回 JWT |
| GET | `/api/v1/me` | 当前用户信息 |
| GET | `/api/v1/me/favorites` | 收藏列表 |
| POST | `/api/v1/me/favorites` | 添加收藏 |
| DELETE | `/api/v1/me/favorites/:targetType/:targetId` | 删除收藏 |
| POST | `/api/v1/me/favorites/sync` | 合并本地收藏到云端 |

---

## 关键实现细节

### JWT
- secret：`APP_JWT_SECRET` 环境变量
- payload：`{ sub: userId, openid, scope: 'user', iat, exp }`
- 过期：30 天（小程序简化方案）
- 验证失败返回 401

### 收藏同步策略
- 云端为登录后的唯一数据源
- 未登录时收藏存本地队列
- 首次登录后 POST `/sync` 合并本地收藏
- 服务端用 unique constraint 去重，返回最终收藏集
- 同步成功后清空本地队列

### CSS 动画方案（替代 framer-motion）
```scss
// app.scss 全局定义
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in-up { animation: fade-in-up 0.3s ease forwards; }
.animate-scale-in { animation: scale-in 0.2s ease forwards; }
.animate-delay-1 { animation-delay: 0.05s; }
.animate-delay-2 { animation-delay: 0.1s; }
.animate-delay-3 { animation-delay: 0.15s; }
```

### 颜色 Token（app.scss）
```scss
:root {
  --color-coffee-dark: #3E2A1E;
  --color-coffee-light: #8B7355;
  --color-bg-warm: #f5f0e8;
  --color-card-bg: #ffffff;
  --color-accent-rust: #c85c3d;
  --color-coffee-medium: #6b5344;
  --color-coffee-pale: #d4c4b5;
  --color-bg-cream: #fdfaf4;
  --color-border: rgba(107, 83, 68, 0.15);
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.03);
  --shadow-card-hover: 0 8px 30px rgba(0, 0, 0, 0.08);
}
```
