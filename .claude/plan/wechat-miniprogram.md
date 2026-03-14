# CoffeeAtlas 微信小程序接入计划
# Taro 多端方案 - Turborepo + API Gateway

> 生成时间：2026-03-12
> 方案：A（Turborepo + API Gateway）
> 来源：Codex 后端规划 + Gemini 前端规划

---

## 目标 Monorepo 结构

```text
CoffeeAtlas-Web/
├── apps/
│   ├── web/                         # Next.js 16 app router + API gateway
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── v1/
│   │   │   │       ├── beans/
│   │   │   │       │   ├── route.ts
│   │   │   │       │   └── [id]/route.ts
│   │   │   │       ├── roasters/
│   │   │   │       │   ├── route.ts
│   │   │   │       │   └── [id]/route.ts
│   │   │   │       └── health/route.ts
│   │   │   ├── page.tsx
│   │   │   └── all-beans/page.tsx
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── server.ts
│   │   │   │   └── browser.ts
│   │   │   ├── repositories/
│   │   │   │   ├── catalog-repository.ts
│   │   │   │   └── roaster-repository.ts
│   │   │   ├── services/
│   │   │   │   ├── catalog-service.ts
│   │   │   │   └── roaster-service.ts
│   │   │   └── api/
│   │   │       ├── responses.ts
│   │   │       ├── errors.ts
│   │   │       └── cache.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── miniprogram/                 # Taro 3.x React + TS
│       ├── src/
│       │   ├── app.config.ts
│       │   ├── app.ts
│       │   ├── app.scss
│       │   ├── pages/
│       │   │   ├── index/
│       │   │   ├── bean-detail/
│       │   │   ├── roaster-detail/
│       │   │   └── search/
│       │   ├── components/
│       │   │   ├── MapCanvas/
│       │   │   ├── BeanCard/
│       │   │   └── ThemeWrapper/
│       │   ├── hooks/
│       │   ├── services/
│       │   └── store/
│       ├── config/
│       │   ├── index.ts
│       │   ├── dev.ts
│       │   └── prod.ts
│       ├── tailwind.config.js
│       └── package.json
├── packages/
│   ├── shared-types/                # API DTOs, query params, result envelopes
│   │   └── src/
│   │       ├── api/
│   │       ├── catalog/
│   │       ├── roasters/
│   │       └── common/
│   ├── domain/                      # Pure domain mapping, schemas
│   │   └── src/
│   │       ├── catalog/
│   │       ├── roasters/
│   │       ├── mappers/
│   │       └── validation/
│   └── api-client/                  # Shared fetch client for web CSR and Taro
│       └── src/
│           ├── client.ts
│           ├── beans.ts
│           ├── roasters.ts
│           └── errors.ts
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## API 设计

### 基础路径：`/api/v1`

### 响应格式

```json
// 成功
{ "ok": true, "data": {}, "meta": { "requestId": "...", "cached": true } }

// 失败
{ "ok": false, "error": { "code": "INVALID_QUERY", "message": "..." }, "meta": { "requestId": "..." } }
```

### 端点列表

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/beans` | GET | 分页咖啡豆列表 |
| `/api/v1/beans/:id` | GET | 咖啡豆详情 |
| `/api/v1/roasters` | GET | 分页烘焙商列表 |
| `/api/v1/roasters/:id` | GET | 烘焙商详情 |

### `/api/v1/beans` 查询参数

- `page`: number, 默认 1
- `pageSize`: number, 默认 20, 最大 50
- `q`: string, 搜索关键词
- `roasterId`, `originCountry`, `process`, `roastLevel`, `inStock`
- `sort`: `updated_desc | sales_desc | price_asc | price_desc`

---

## 数据访问层重构

### 当前状态
`lib/catalog.ts` 混合了查询、聚合、DTO 映射

### 目标分层

```
Repository（Supabase 查询）
    ↓
Service（业务逻辑、聚合）
    ↓
Mapper（DTO 转换）
    ↓
API Route Handler（HTTP 响应）
```

### 关键方法

```typescript
// catalog-service.ts
listCatalogBeans(query): Promise<PaginatedResult<CatalogBeanCard>>
getCatalogBeanDetail(id): Promise<CatalogBeanDetail | null>

// roaster-service.ts
listRoasters(query): Promise<PaginatedResult<RoasterSummary>>
getRoasterDetail(id, options): Promise<RoasterDetail | null>
```

---

## 环境变量矩阵

| 变量 | 位置 | 是否敏感 |
|------|------|---------|
| `SUPABASE_URL` | apps/web 服务端 | 否 |
| `SUPABASE_SERVICE_ROLE_KEY` | apps/web 服务端 | **是** |
| `SUPABASE_ANON_KEY` | apps/web 服务端 | 低 |
| `NEXT_PUBLIC_SITE_URL` | apps/web 公开 | 否 |
| `TARO_APP_API_BASE_URL` | apps/miniprogram | 否 |
| `TARO_APP_ENV` | apps/miniprogram | 否 |

**规则**：共享包不读取 `process.env`，小程序只拿 API 网关 URL

---

## 前端架构（Taro）

### 页面列表

| 页面 | 路径 | 对应 Web 页面 |
|------|------|-------------|
| 首页/发现 | `/pages/index` | `app/page.tsx` |
| 全部咖啡豆 | `/pages/beans` | `app/all-beans/page.tsx` |
| 咖啡豆详情 | `/pages/bean-detail` | 新增 |
| 烘焙商详情 | `/pages/roaster-detail` | 新增 |
| 搜索 | `/pages/search` | 新增 |

### 组件迁移策略

| 组件类型 | 策略 |
|---------|------|
| 领域逻辑 | 共享 via `packages/domain` |
| API 客户端 | 共享 via `packages/api-client` |
| UI 组件 | 选择性复用（div→View, span→Text） |
| SVG 地图 | **完全重写** → Canvas 2D API |
| 动画 | **替换** → `Taro.createAnimation` |
| 图标 | **优化** → SVG sprite 或 Iconfont |

### 样式系统

```scss
/* app.scss - CSS Variables 绑定到 page 选择器 */
page {
  --color-coffee-dark: #1a1614;
  --color-bg-warm: #f5f0e8;
  /* ... 其他 design tokens */
}
```

- 使用 `taro-plugin-tailwind` 处理 rem→rpx 转换
- 清理小程序不支持的 CSS 选择器（如 `*`）

### TabBar 设计

- **发现**：地图导航（首页）
- **排行**：销量排行榜
- **我的**：收藏和设置（未来扩展）

---

## 缓存策略

| 端点类型 | Cache-Control |
|---------|---------------|
| 列表接口 | `public, s-maxage=300, stale-while-revalidate=600` |
| 详情接口 | `public, s-maxage=120, stale-while-revalidate=300` |

- 小程序端：`Taro.setStorage` 缓存烘焙商列表和国家配置
- 策略：Stale-While-Revalidate

---

## 实施顺序（Rollout Order）

### Phase 1：Monorepo 结构搭建
1. 创建 Monorepo 根目录（`pnpm-workspace.yaml`, `turbo.json`）
2. 将现有项目迁移到 `apps/web`
3. 创建 `packages/shared-types`, `packages/domain`, `packages/api-client`

### Phase 2：数据访问层重构
4. 拆分 `lib/catalog.ts` → repository + service + mapper
5. 创建 `lib/repositories/catalog-repository.ts`
6. 创建 `lib/services/catalog-service.ts`

### Phase 3：API 中间层开发
7. 实现 `/api/v1/beans` 和 `/api/v1/beans/:id`
8. 实现 `/api/v1/roasters` 和 `/api/v1/roasters/:id`
9. 添加缓存头、错误处理、请求 ID

### Phase 4：Taro 项目初始化
10. 初始化 `apps/miniprogram`（Taro CLI）
11. 配置 `taro-plugin-tailwind`
12. 配置环境变量

### Phase 5：核心功能迁移
13. 实现首页（咖啡豆列表）
14. 实现全部咖啡豆页面
15. 实现咖啡豆详情页
16. 实现搜索功能

### Phase 6：样式适配和优化
17. 骨架屏组件
18. 图片懒加载
19. 分享功能（`onShareAppMessage`）
20. 性能测试和优化

---

## 风险和缓解措施

| 风险 | 缓解措施 |
|------|---------|
| Taro 学习曲线 | 第一期只做列表、详情、搜索 |
| 样式迁移成本 | 接受"视觉同品牌、非同实现" |
| API 层成为瓶颈 | 列表接口做缓存头 |
| 共享代码边界失控 | 禁止 shared package 引入 next/* 或 @tarojs/* |
| 环境变量泄漏 | 私密变量仅存在 apps/web |

---

## 验收标准

- [ ] 微信小程序可以正常运行
- [ ] 实现所有 Web 端功能
- [ ] API 响应时间 < 500ms
- [ ] 小程序包大小 < 2MB（主包）
- [ ] H5 页面可以在微信中正常打开
- [ ] 代码通过 lint 和 typecheck
