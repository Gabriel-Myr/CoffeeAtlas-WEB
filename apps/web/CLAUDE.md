[根目录](../../CLAUDE.md) > apps > **web**

# apps/web — Next.js Web 应用

## 模块职责

CoffeeAtlas 的 Web 前端与 API 网关。承担三个角色：
1. 面向用户的咖啡豆目录浏览页面（React / Tailwind）
2. 供微信小程序调用的 RESTful API 网关（`/api/v1/*`）
3. 管理员数据录入接口（`/api/admin/*`，规划中）

---

## 入口与启动

- 入口：`app/layout.tsx` → `app/page.tsx` → `app/HomePageClient.tsx`
- 启动：`pnpm dev`（在 `apps/web` 目录下）或根目录 `pnpm dev`
- 健康检查：`GET /api/health` → `{ ok: true, service: "coffeestories-webdb", ts: "..." }`

---

## 对外接口

### 已实现

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |

### 规划中（见 `.claude/plan/wechat-miniprogram.md`）

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/v1/beans` | GET | 分页咖啡豆列表，支持 `page/pageSize/q/originCountry/process/roastLevel` |
| `/api/v1/beans/:id` | GET | 咖啡豆详情 |
| `/api/v1/roasters` | GET | 分页烘焙商列表，支持 `page/pageSize/q/city` |
| `/api/v1/roasters/:id` | GET | 烘焙商详情（含豆款列表） |

API 响应信封（来自 `@coffee-atlas/shared-types`）：
- 成功：`{ ok: true, data: T, meta: { requestId } }`
- 失败：`{ ok: false, error: { code, message }, meta: { requestId } }`

---

## 关键依赖与配置

```json
{
  "next": "^16.0.7",
  "react": "19.0.0",
  "@supabase/supabase-js": "^2.57.0",
  "tailwindcss": "^4.2.1",
  "motion": "^12.34.3",
  "lucide-react": "^0.575.0"
}
```

- `next.config.ts`：仅启用 `reactStrictMode: true`
- `postcss.config.mjs`：Tailwind CSS v4 PostCSS 插件
- 无 ESLint 自定义规则，使用 `eslint-config-next` 默认配置

---

## 数据模型

### 核心表（Supabase PostgreSQL）

| 表 | 说明 |
|----|------|
| `roasters` | 烘焙商，含 `search_tsv` 全文索引 |
| `beans` | 咖啡豆规格（产地、处理法、品种等），含 `search_tsv` |
| `roaster_beans` | 烘焙商-豆款关联，含价格、库存、状态（DRAFT/ACTIVE/ARCHIVED） |
| `price_snapshots` | 价格历史快照 |
| `sources` | 数据来源（手动/官网/电商/社交） |
| `import_jobs` | 导入任务记录 |
| `ingestion_events` | 数据摄取事件日志 |
| `change_requests` | 变更申请（编辑提议 → 管理员审批） |
| `bean_aliases` | 豆款别名（多语言） |

### 关键视图与函数

- `v_catalog_active`：公开活跃豆款视图（`status = 'ACTIVE'`）
- `v_catalog_admin`：管理员视图（含状态、来源）
- `search_catalog(p_query, p_limit, p_offset)`：加权全文搜索（tsvector + pg_trgm 相似度）

### TypeScript 类型

- `lib/types.ts`：内部类型（`Roaster`, `Bean`, `RoasterBean`, `CatalogRow` 等）
- `lib/catalog.ts`：`CoffeeBean`, `Roaster` 接口及所有数据访问函数

---

## 核心库文件

| 文件 | 职责 |
|------|------|
| `lib/catalog.ts` | 数据访问层：Supabase 查询 + 样本数据降级 |
| `lib/supabase.ts` | Supabase 客户端初始化，含 `hasSupabaseServerEnv` 降级标志 |
| `lib/sales.ts` | 销量数字解析（支持"万"）和格式化 |
| `lib/server/public-api.ts` | 公开 API 业务逻辑（`listBeansV1`, `listRoastersV1` 等） |
| `lib/server/admin-catalog.ts` | 管理员数据写入逻辑（`createAdminBean`, `searchAdminRoasters`） |
| `lib/server/admin-auth.ts` | 管理员鉴权占位（当前无实际鉴权） |
| `lib/server/api-helpers.ts` | HTTP 响应工具（`apiSuccess`, `apiError`） |
| `lib/server/api-primitives.ts` | 参数解析工具（`parsePaginationParams`, `sanitizeSearchTerm` 等） |

---

## 页面结构

| 路由 | 文件 | 说明 |
|------|------|------|
| `/` | `app/page.tsx` + `app/HomePageClient.tsx` | 首页，含地图探索、搜索、豆款卡片 |
| `/all-beans` | `app/all-beans/page.tsx` + `AllBeansClient.tsx` | 全部豆款列表 |
| `/geo-preview` | `app/geo-preview/page.tsx` | 地理预览（开发用） |
| `/geo-compare` | `app/geo-compare/page.tsx` | 地理对比（开发用） |

---

## 测试与质量

- 测试命令：`pnpm test`（`node --test --experimental-strip-types tests/**/*.test.ts`）
- 测试目录：`tests/`（尚未创建，为主要缺口）
- Lint：`pnpm lint`（`next lint`）
- 类型检查：`pnpm typecheck`（`tsc --noEmit`）

---

## 常见问题 (FAQ)

**Q: 没有 Supabase 配置时如何开发？**
A: 应用自动降级为 `lib/sample-data.ts` 中的静态数据，`hasSupabaseServerEnv` 为 `false`。

**Q: 如何添加新的 API 路由？**
A: 在 `app/api/v1/` 下创建路由文件，使用 `lib/server/api-helpers.ts` 的 `apiSuccess`/`apiError` 包装响应，业务逻辑放在 `lib/server/public-api.ts`。

**Q: 管理员鉴权在哪里？**
A: `lib/server/admin-auth.ts` 目前是占位实现，`requireAdmin()` 直接返回 `actor: 'admin-placeholder'`，需要在 Phase 2 接入真实鉴权。

---

## 相关文件清单

- `/Users/gabi/CoffeeAtlas-Web/apps/web/app/layout.tsx`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/app/page.tsx`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/app/HomePageClient.tsx`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/supabase.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/public-api.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/admin-catalog.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/db/sql/010_schema.sql`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/db/sql/040_views_and_functions.sql`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/docs/roadmap.md`

## 变更记录 (Changelog)

| 日期 | 说明 |
|------|------|
| 2026-03-14 | 初次生成 |
