# Database Guidelines

---

## 1. Scope / Trigger

当你修改以下任一内容时，先读这份文档：

- `apps/web/lib/catalog.ts`
- `apps/web/lib/server/public-api.ts`
- `apps/web/lib/server/favorites-api.ts`
- `apps/web/lib/server/admin-catalog.ts`
- `apps/web/lib/supabase.ts`
- `apps/web/db/sql/**`
- `apps/web/db/migrations/**`
- `apps/web/scripts/import-*.ts`

---

## 2. Core Query Pattern

### Server-only DB access goes through `requireSupabaseServer()`

```ts
import { requireSupabaseServer } from '@/lib/supabase';

const db = requireSupabaseServer();
const { data, error } = await db.from('app_users').select('*');
if (error) throw error;
```

规则：

- 服务端代码默认用 `requireSupabaseServer()`，不要在 query helper 里直接重新读环境变量。
- 只有读取型 catalog/roaster 流程可以先看 `hasSupabaseServerEnv` 再走 sample fallback。
- 收藏、登录、管理写接口必须要求真实 Supabase 环境，不允许返回假成功。

---

## 3. Row Types Stay Snake Case, App Models Stay Camel Case

当前仓库的做法是：

- Supabase row/interface：本地定义，保留 snake_case
- UI/API model：映射后输出 camelCase

示例：`apps/web/lib/catalog.ts`

```ts
type RoasterBeanRow = {
  roaster_id: string | null;
  price_amount: number | string | null;
  image_url: string | null;
};

function mapCoffeeBean(item: RoasterBeanRow): CoffeeBean {
  return {
    roasterId: item.roaster_id ?? '',
    price: toNumber(item.price_amount),
    imageUrl: item.image_url,
  };
}
```

不要把 row shape 直接透传到前端或 shared-types。

---

## 4. Prefer Batch Fetch + Map Join

当一条记录需要 roaster / bean / favorites 等上下文时，优先批量查 + `Map` 合并，避免 N+1。

现有参考：

- `apps/web/lib/catalog.ts` -> `fetchBeanContext()`
- `apps/web/lib/server/favorites-api.ts` -> `hydrateFavorites()`

推荐模式：

```ts
const ids = [...new Set(rows.map((row) => row.bean_id).filter(Boolean))];
const { data, error } = await db.from('beans').select('*').in('id', ids);
if (error) throw error;

const beanMap = new Map((data ?? []).map((row) => [row.id, row]));
return rows.map((row) => beanMap.get(row.bean_id ?? ''));
```

---

## 5. Use Views / RPC For Public Catalog Work

公开目录查询优先使用已经存在的 DB 入口：

- 视图：`v_catalog_active`
- RPC：`search_catalog`

对应代码：

- `apps/web/lib/server/public-api.ts`
- `apps/web/lib/catalog.ts`

如果是：

- 搜索、discover 选项统计、公开分页列表 -> 优先复用视图 / RPC
- 明细 hydration -> 再回到 `getCatalogBeansByIds()` / `getRoastersByIds()`

不要为同一公开列表逻辑同时维护两套不同 SQL 规则。

---

## 6. Fallback Rules

### Good
- `getCatalogBeansPage()` 在缺少 Supabase 配置时回退到 `sampleCatalog`
- `listBeansV1()` / `getBeanDiscoverV1()` 在本地开发时仍可返回可浏览数据

### Bad
- `wechatLogin()` 缺配置时悄悄返回 mock token
- `addFavorite()` 失败时静默吞掉 DB 错误
- 管理写接口用 sample data 冒充成功写入

读操作 fallback 是开发体验策略；写操作和鉴权必须失败得明确。

---

## 7. Migrations And Schema Files

当前仓库同时有两层 SQL：

- `apps/web/db/sql/**` - 基础 schema、索引、RLS、视图、seed
- `apps/web/db/migrations/**` - 后续应用级增量修改

规则：

- 新的增量改动优先追加到 `apps/web/db/migrations/**`
- 不要重写已经被环境使用过的历史迁移
- 如果基础 schema 契约真的变了，要同步更新对应 Trellis spec 和相关脚本说明

---

## 8. Environment Contract

| Key | Required | Use |
|-----|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | browser/server 共用项目地址 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | browser client，server fallback 也会用到 |
| `SUPABASE_SERVICE_ROLE_KEY` | Strongly recommended | server 写操作、绕过 RLS |

永远不要在代码、迁移说明、脚本示例里粘贴真实 key。
