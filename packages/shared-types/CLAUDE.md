[根目录](../../CLAUDE.md) > packages > **shared-types**

# packages/shared-types — 共享类型定义

## 模块职责

跨平台共享的 TypeScript 类型定义包。定义 API 响应信封、分页结构、咖啡豆和烘焙商的 DTO 类型，以及查询参数接口。
`apps/web` 和未来的 `apps/miniprogram` 均依赖此包。

---

## 入口与启动

- 入口：`src/index.ts`
- 构建：`pnpm build`（`tsc -b`）
- 产物：`dist/`（`.js` + `.d.ts` + source map）
- 包名：`@coffee-atlas/shared-types`

---

## 对外接口

### API 响应信封（`src/index.ts`）

```typescript
interface ApiResponse<T> { ok: true; data: T; meta: { requestId: string; cached?: boolean } }
interface ApiError { ok: false; error: { code: string; message: string }; meta: { requestId: string } }
interface PaginatedResult<T> { items: T[]; pageInfo: PageInfo }
interface PageInfo { page: number; pageSize: number; total: number; hasNextPage: boolean }
```

### 咖啡豆类型（`src/catalog/index.ts`）

```typescript
interface CatalogBeanCard    // 列表视图：id, name, roasterId, roasterName, city, originCountry, process, roastLevel, price, currency, salesCount, imageUrl, isInStock
interface CatalogBeanDetail  // 详情视图：extends CatalogBeanCard + originRegion, farm, variety, discountedPrice, tastingNotes, isNewArrival
interface BeansQueryParams   // 查询参数：page, pageSize, q, roasterId, originCountry, process, roastLevel, inStock, sort
```

### 烘焙商类型（`src/roasters/index.ts`）

```typescript
interface RoasterSummary     // 列表视图：id, name, city, beanCount?
interface RoasterDetail      // 详情视图：extends RoasterSummary + beans?: CatalogBeanCard[]
interface RoastersQueryParams // 查询参数：page, pageSize, q, city, sort
```

### 公共枚举（`src/common/index.ts`）

```typescript
type Currency = 'CNY' | 'USD' | 'EUR'
type RoastLevel = 'LIGHT' | 'MEDIUM_LIGHT' | 'MEDIUM' | 'MEDIUM_DARK' | 'DARK'
type ProcessMethod = 'WASHED' | 'NATURAL' | 'HONEY' | 'ANAEROBIC' | 'OTHER'
```

---

## 关键依赖与配置

- 无运行时依赖
- devDependencies：`typescript 5.8.2`
- `tsconfig.json` 继承 `../../tsconfig.base.json`

---

## 数据模型

此包仅定义类型，无运行时数据模型。

---

## 测试与质量

- 无测试配置（缺口）
- 类型检查：`pnpm typecheck`

---

## 相关文件清单

- `/Users/gabi/CoffeeAtlas-Web/packages/shared-types/src/index.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/shared-types/src/catalog/index.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/shared-types/src/roasters/index.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/shared-types/src/common/index.ts`

## 变更记录 (Changelog)

| 日期 | 说明 |
|------|------|
| 2026-03-14 | 初次生成 |
