# 数据层规范

> 本文档是仓库级数据层总览；更细的查询、错误和契约规则请结合 `/Users/gabi/CoffeeAtlas-Web/.trellis/spec/api/backend/database-guidelines.md` 与 `/Users/gabi/CoffeeAtlas-Web/.trellis/spec/api/backend/type-safety.md` 一起看。

---

## 数据访问分层

当前仓库的数据访问主要分 4 层：

1. **Supabase client 层**
   - `/Users/gabi/CoffeeAtlas-Web/apps/api/lib/supabase.ts`
   - 提供 `supabaseBrowser`、`supabaseServer`、`requireSupabaseBrowser()`、`requireSupabaseServer()`

2. **内部读取模型层**
   - `/Users/gabi/CoffeeAtlas-Web/apps/api/lib/catalog.ts`
   - 负责公开 catalog / roaster 读取、sample fallback、row -> app model 映射

3. **API 组装层**
   - `/Users/gabi/CoffeeAtlas-Web/apps/api/lib/server/public-api.ts`
   - `/Users/gabi/CoffeeAtlas-Web/apps/api/lib/server/favorites-api.ts`
   - `/Users/gabi/CoffeeAtlas-Web/apps/api/lib/server/admin-catalog.ts`
   - 负责把内部模型映射成 shared-types DTO、补分页、补鉴权和收藏逻辑

4. **消费层**
   - 小程序通过 `src/services/api.ts` 调 `/api/v1/*`
   - 目录读取可走 `catalog-supabase.ts`
   - legacy API 接口仍保留 `/api/beans`、`/api/roasters`、`/api/health`

---

## Supabase 客户端现实

### `supabaseBrowser`

- 只有在 `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` 存在时才初始化
- 当前仓库的主数据读取并不依赖客户端直连 Supabase；大多数页面还是走 server 读取或 API
- 如果未来客户端直连读取公开数据，必须确认不会把 server-only helper 引进 client side

### `supabaseServer`

- 只要 `NEXT_PUBLIC_SUPABASE_URL` 加上 `SUPABASE_SERVICE_ROLE_KEY` 或 anon key 即可初始化
- 服务端读取、写操作、收藏、微信登录、导入脚本都依赖它
- 需要真实 server-side DB 能力时，统一调用 `requireSupabaseServer()`

示例：

```ts
import { requireSupabaseServer } from '@/lib/supabase';

const db = requireSupabaseServer();
const { data, error } = await db.from('app_users').select('*');
if (error) throw error;
```

---

## 当前主数据流

### 1. 小程序 / 新客户端

```text
apps/miniprogram/src/services/api.ts
  -> /api/v1/*
  -> lib/server/public-api.ts / favorites-api.ts / auth-user.ts
  -> Supabase
```

参考：
- `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/services/api.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/api/app/api/v1/**`

### 2. 小程序目录直连读取

```text
apps/miniprogram/src/services/catalog-supabase.ts
  -> 小程序 Supabase client
  -> 公开目录只读查询
```

### 3. legacy API 接口

```text
/api/beans or /api/roasters
  -> public-api.ts
  -> legacy JSON 结构
```

这些路由仍然存在，但不是新接口的首选契约层。

---

## 数据形状分层

### 数据库 row

- 只在 server 侧使用
- 保持 snake_case
- 常见位置：`catalog.ts` 里的 `RoasterBeanRow`、`BeanRow`、`RoasterRow`

### 内部 app model

- 主要在 `/Users/gabi/CoffeeAtlas-Web/apps/api/lib/catalog.ts`
- 例如 `CoffeeBean`、`Roaster`
- 适合页面渲染和服务端内部拼装

### API DTO

- 权威来源：`/Users/gabi/CoffeeAtlas-Web/packages/shared-types/src/**`
- `/api/v1/*` 对外输出应尽量对齐 shared-types
- 小程序本地类型 `/Users/gabi/CoffeeAtlas-Web/apps/miniprogram/src/types/index.ts` 当前仍有镜像，改契约时要同步

---

## Fallback 策略

### 允许 fallback 的场景

- 公开 beans / roasters 读取
- 本地开发时首页、目录、discover 体验

当前 fallback 数据源：
- `/Users/gabi/CoffeeAtlas-Web/apps/api/lib/sample-data.ts`

### 不允许 fallback 的场景

- 微信登录
- 用户资料
- 收藏读写与同步
- 管理写接口
- 导入脚本

这些流程缺配置时必须明确失败，不能伪造成功结果。

---

## Auth / Favorites 数据路径

- 用户表与收藏表迁移：`/Users/gabi/CoffeeAtlas-Web/apps/api/db/migrations/001_app_users_and_favorites.sql`
- JWT 逻辑：`/Users/gabi/CoffeeAtlas-Web/apps/api/lib/server/auth-jwt.ts`
- 请求鉴权：`/Users/gabi/CoffeeAtlas-Web/apps/api/lib/server/auth-user.ts`
- 收藏 hydration：`/Users/gabi/CoffeeAtlas-Web/apps/api/lib/server/favorites-api.ts`

这个链路属于真实写路径；不要把 sample fallback 逻辑带进来。

---

## 环境变量契约

### API / server
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_JWT_SECRET`
- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`

### Miniprogram
- `TARO_APP_API_URL`

---

## 当前技术债

以下问题已经存在于仓库现实中，Trellis 需要记住，但新改动不要复制它们：

1. `/Users/gabi/CoffeeAtlas-Web/apps/api/scripts/import-roasters.ts`、`/Users/gabi/CoffeeAtlas-Web/apps/api/scripts/import-beans.ts`、`/Users/gabi/CoffeeAtlas-Web/apps/api/scripts/import-sales.ts` 仍内嵌 fallback 凭据
2. `/Users/gabi/CoffeeAtlas-Web/apps/api/scripts/import-sales.ts` 依赖绝对路径 Excel 文件
3. v1 shared-types 与 miniprogram 本地镜像类型存在双份维护成本
4. legacy `/api/beans` / `/api/roasters` 与 `/api/v1/*` 并存，后续要继续管理兼容边界

这些都应被视为待清理的现实债务，而不是新代码模式。
