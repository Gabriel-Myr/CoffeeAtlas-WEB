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

## API Type Layers

### 1. Internal app models (`apps/api/lib/catalog.ts`)

`CoffeeBean`、`Roaster` 属于 API 内部读取模型：

- 来源：Supabase + sample fallback
- 用途：页面渲染、v1 DTO 组装、favorites hydration
- 不是对外契约层

### 2. API DTO (`packages/shared-types/src/**`)

v1 route 出口必须尽量对齐 shared-types，而不是直接返回 `lib/catalog.ts` 原型。

### 3. Local helper/input types

比如：

- `JwtPayload`
- `CreateAdminBeanInput`
- Taro 组件 props

这类类型可以留在本地文件，不必全部提升到 shared-types。

---

## Miniprogram Types

当前小程序仍保留 `apps/miniprogram/src/types/index.ts` 这份本地类型镜像，主要原因：

- `packages/api-client` 尚未成为主运行时 client
- 小程序直接调用 `src/services/api.ts`

规则：

- 改 v1 契约时，必须同时检查 `packages/shared-types` 和 `apps/miniprogram/src/types/index.ts`
- 如果字段只在小程序本地 storage/UI 中使用，可以保留在小程序本地类型
- 不要让 shared-types 与 miniprogram 本地类型长期悄悄分叉

---

## Row Shape Never Leaks Into UI

数据库 row 在 API server 侧保持 snake_case，本地模型 / props / DTO 用 camelCase。

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
- Supabase 返回值需要 cast 时，在 query 边界立即 cast，不要让松散类型往下游传

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

- Next.js 类型只留在 `apps/api/**`
- Taro 类型只留在 `apps/miniprogram/**`
- `packages/*` 保持平台无关
