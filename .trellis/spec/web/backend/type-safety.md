# Backend Type Safety

---

## Canonical Contract Layer

`@coffee-atlas/shared-types` 是当前 v1 API 的权威边界契约。

适用范围：

- API response envelope: `ApiResponse`, `ApiError`
- 分页：`PaginatedResult`, `PageInfo`
- beans / roasters / favorites DTO
- query param 枚举，例如 `BeanSort`, `RoasterFeature`

如果你改了 `/api/v1/*` 的响应字段，先改 shared-types，再同步实现和消费者。

---

## Local Types Are Allowed For Internal Shapes

以下类型保持本地定义，不强行放到 shared-types：

- Supabase row interfaces
- JWT payload
- route params promise shape
- admin-only input normalization shape

现有例子：

- `apps/web/lib/catalog.ts` -> `RoasterBeanRow`, `BeanRow`, `RoasterRow`
- `apps/web/lib/server/auth-jwt.ts` -> `JwtPayload`
- `apps/web/lib/server/admin-catalog.ts` -> `CreateAdminBeanInput`

原则：边界共享，内部私有。

---

## Use Type Predicates Instead Of Loose Casting

推荐：

```ts
const ids = rows
  .map((row) => row.roaster_bean_id)
  .filter((id): id is string => typeof id === 'string' && id.length > 0);
```

避免：

```ts
const ids = rows.map((row) => row.roaster_bean_id as string);
```

---

## Supabase Casting Rule

Supabase `.select()` 的返回值常常需要边界 cast，但要遵守：

1. cast 发生在最靠近 query 的地方
2. cast 后尽快 map 到更稳定的 app model / DTO
3. 不要把 `any` 继续传递给下一层

### Good

```ts
const rows = (data ?? []) as UserFavoriteRow[];
return hydrateFavorites(rows);
```

### Bad

```ts
const rows: any[] = data ?? [];
return rows;
```

---

## Platform Types Stay Inside Apps

- `NextRequest`, `NextResponse` 只留在 `apps/web/**`
- `Taro.*` 类型只留在 `apps/miniprogram/**`
- `packages/*` 不能依赖 Next/Taro 平台类型

这样 `shared-types` 和未来 `domain` / `api-client` 才能继续跨端复用。
