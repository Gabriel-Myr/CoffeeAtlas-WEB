# Type Safety

---

## Canonical Contract Layer

`@coffee-atlas/shared-types` 是当前 v1 API 的主契约层。

这里维护：

- `ApiResponse<T>` / `ApiError`
- `PaginatedResult<T>` / `PageInfo`
- `CatalogBeanCard` / `CatalogBeanDetail`
- `RoasterSummary` / `RoasterDetail`
- favorites DTO
- `BeanSort`、`BeanDiscoverContinent`、`RoasterFeature` 等 query enum

如果 `/api/v1/*` 改了字段，先改 shared-types，再改实现和 consumer。

---

## Read-Only Upstream Context

### 1. Web server internal models (`apps/web/lib/catalog.ts`)

`CoffeeBean`、`Roaster` 等模型属于 Web 侧内部读取模型：

- 来源：Supabase + sample fallback
- 用途：页面渲染、v1 DTO 组装、favorites hydration
- 对小程序来说，它们是“理解服务端来源”的参考，不是直接复用的契约层

### 2. API DTO (`packages/shared-types/src/**`)

v1 route 出口必须尽量对齐 shared-types，而不是直接返回 `lib/catalog.ts` 原型。

### 3. Local app types (`apps/miniprogram/src/types/index.ts`)

当前小程序仍保留本地类型镜像，`src/services/api.ts` 也仍从这里 import 多数业务类型。

### 4. Local helper/input types

比如：

- `JwtPayload`
- `CreateAdminBeanInput`
- Taro 组件 props
- route params / entry intent 相关本地类型

这类类型可以留在本地文件，不必全部提升到 shared-types。

---

## Miniprogram Types

当前小程序仍保留 `apps/miniprogram/src/types/index.ts` 这份本地类型镜像，主要原因：

- `src/services/api.ts` 仍是小程序运行时主 client
- `packages/api-client` 当前主要提供 path builder、unwrap、error helper
- 小程序直接调用 `src/services/api.ts`

规则：

- 改 v1 契约时，必须同时检查 `packages/shared-types` 和 `apps/miniprogram/src/types/index.ts`
- 如果 `src/services/api.ts` 的返回值、入参或错误分支变化，要同步检查页面 consumer
- 如果字段只在小程序本地 storage/UI 中使用，可以保留在小程序本地类型
- 不要让 shared-types 与 miniprogram 本地类型长期悄悄分叉

---

## Local Storage And UI Shapes

storage snapshot、页面 props、组件 props 都使用 camelCase，并保持面向 UI 的结构。

当前已知本地 shape 例子：

- `BeanSnapshot` / `RoasterSnapshot`
- `PendingFavorite`
- `HistoryItem`
- `OnboardingProfile`

规则：

- 页面和组件不要直接依赖服务端 row shape
- storage shape 改动时要同步更新 helper 与调用方

---

## Row Shape Never Leaks Into UI

数据库 row 在 Web server 侧保持 snake_case，本地模型 / props / DTO 用 camelCase。

### Good

```ts
type RoasterBeanRow = {
  price_amount: number | string | null;
  image_url: string | null;
};

function mapCoffeeBean(row: RoasterBeanRow): CoffeeBean {
  return {
    price: toNumber(row.price_amount),
    imageUrl: row.image_url,
  };
}
```

### Bad

```ts
return {
  price_amount: row.price_amount,
  image_url: row.image_url,
};
```

---

## Preferred Narrowing Patterns

- 优先 `typeof` / `Array.isArray` / type predicate
- 尽量避免 `as any`
- 服务端 query 返回值需要 cast 时，在边界立即收敛，不要让松散类型往下游传

### Good

```ts
const ids = rows
  .map((row) => row.roaster_bean_id)
  .filter((id): id is string => typeof id === 'string' && id.length > 0);
```

### Bad

```ts
const ids = rows.map((row) => row.roaster_bean_id as string);
```

---

## Platform Type Boundaries

- Next.js 类型只留在 `apps/web/**`
- Taro 类型只留在 `apps/miniprogram/**`
- `packages/*` 保持平台无关
- `packages/domain` 可以承载平台无关 snapshot 类型，但不要把 Taro 页面状态直接塞进去
