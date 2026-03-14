# Type Safety

---

## TypeScript 配置

- `strict: true`（所有项目）
- `noUncheckedIndexedAccess: true`（packages/shared-types）
- 禁止使用 `any`，用 `unknown` + 类型守卫代替

---

## 类型分层

### 1. 数据库实体（apps/web/lib/types.ts）

直接映射 Supabase 表结构：

```ts
export interface CoffeeBean {
  id: string;
  name: string;
  roaster_id: string;
  origin: string | null;
  process: string | null;
  price: number | null;
  sales_count: number | null;
  image_url: string | null;
  created_at: string;
}
```

### 2. API DTO（packages/shared-types）

跨平台共享，用于 API 请求/响应：

```ts
// packages/shared-types/src/index.ts
export interface V1Response<T> {
  data: T;
  error: null;
}

export interface V1ErrorResponse {
  data: null;
  error: { code: string; message: string };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

### 3. 小程序本地类型（apps/miniprogram/src/types/index.ts）

```ts
export interface CoffeeBean {
  id: string;
  name: string;
  roasterName: string;
  origin: string | null;
  process: string | null;
  price: number | null;
  salesCount: number | null;
  imageUrl: string | null;
}

export interface AuthUser {
  id: string;
  openid: string;
  nickname: string | null;
  avatarUrl: string | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
```

---

## API 响应类型守卫

```ts
function isV1Error(res: unknown): res is V1ErrorResponse {
  return typeof res === 'object' && res !== null && 'error' in res && (res as any).error !== null;
}
```

## 禁止模式

- 禁止 `as any`（用 `as unknown as T` 并注释原因）
- 禁止在 API 响应处理中跳过类型检查
- 禁止在 `packages/*` 中使用平台特定类型（`NextRequest`、`TaroElement` 等）
