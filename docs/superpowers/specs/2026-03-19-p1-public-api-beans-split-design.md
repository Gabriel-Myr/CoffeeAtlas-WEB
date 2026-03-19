# P1 Public API Beans Split Design

**Goal:** 在不改变现有 API 行为的前提下，把 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/public-api.ts` 里的 beans 公开读取逻辑拆成更小的后端模块，先把最容易继续膨胀的 beans/discover 部分从 God file 中拿出来。

## 现状

- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/public-api.ts` 已经有 800+ 行。
- 文件里混着 4 类职责：
  - beans DTO 映射
  - beans 列表/明细查询
  - beans discover/editorial/fallback 组装
  - roasters 列表/明细公开接口
- Web 路由当前都直接 import `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/public-api.ts` 的导出：
  - `listBeansV1`
  - `getBeanDetailV1`
  - `getBeanDiscoverV1`
  - `listRoastersV1`
  - `getRoasterDetailV1`

## 方案选择

### 方案 A（采用）

只拆 beans 相关逻辑：

- 新增 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/public-beans.ts`
- 新增 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/public-bean-discover.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/public-api.ts` 保留 roasters 逻辑，并转发 beans 相关导出

这样可以先把最重的 beans/discover 逻辑切开，同时不扩大到 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts`。

### 不采用的方案

- 同时拆 `public-api.ts` 和 `catalog.ts`
  - 范围过大，容易把 fallback、查询、映射一起搅乱
- 只在 `public-api.ts` 内重排函数
  - 文件会稍微整齐，但 God file 结构不变

## 目标边界

这轮只做结构重排，不做产品行为修改：

- 不改变 legacy 路由和 v1 路由的响应格式
- 不改变 beans/discover/roasters 的返回字段
- 不改变 Supabase 优先、sample fallback 兜底的策略
- 不改 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts`
- 不顺手改 roasters 行为

## 设计

### 1. `public-beans.ts`

职责：

- 定义 beans 公开接口用到的内部 filters/type
- 承接 beans 列表查询与计数
- 承接 bean detail 映射
- 暴露：
  - `listBeansV1`
  - `getBeanDetailV1`
  - `mapBeanCard`
  - `mapBeanDetail`

约束：

- 继续复用 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts`
- 继续复用 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/new-arrivals.ts`
- 不引入 Next.js 平台类型

### 2. `public-bean-discover.ts`

职责：

- 承接 discover rows/options/editorial/editor picks/fallback payload
- 复用 `public-beans.ts` 暴露的 beans mapper/filter 工具
- 暴露：
  - `getBeanDiscoverV1`

约束：

- 保持现有“主路径失败时 fallback discover payload”行为
- 保持 editorial config 选择逻辑不变

### 3. `public-api.ts`

职责收敛为：

- 作为兼容入口继续暴露旧导出名
- 保留 roasters 列表/详情逻辑
- 转发 beans/discover 导出，避免路由 import 路径大面积修改

## 数据流

### Beans 列表

1. route handler 解析 query
2. `listBeansV1` 归一化 filters
3. 有 Supabase 时走 view 查询 + count
4. 无 Supabase 时走 local fallback
5. 返回 `PaginatedResult<CatalogBeanCard>`

### Beans Discover

1. route handler 解析 discover filters
2. `getBeanDiscoverV1` 归一化 filters
3. 主路径：
   - 查 process/continent/country 选项
   - 查 total
   - 生成 editorial picks
4. 主路径失败时：
   - 走 local fallback payload
5. 返回 `BeanDiscoverPayload`

## 测试策略

本轮优先保证“拆分后行为不变”，因此测试以纯函数和导出边界为主：

- 新增 `/Users/gabi/CoffeeAtlas-Web/apps/web/tests/public-api-beans.test.ts`
  - 锁定 beans 相关导出仍可从 `public-api.ts` 使用
  - 锁定 mapper / fallback helper 的稳定行为（只测纯逻辑）
- 保留现有 `/Users/gabi/CoffeeAtlas-Web/apps/web/tests/bean-query-params.test.ts`
- 跑完整 Web test/typecheck/lint，防止拆分后 import 断裂

## 风险与控制

### 风险 1：拆分时循环依赖

控制：

- `public-beans.ts` 只向 discover 暴露最小必要 helper
- `public-bean-discover.ts` 不反向 import `public-api.ts`

### 风险 2：路由侧 import 断裂

控制：

- 暂不改 route import 路径
- `public-api.ts` 继续做统一入口

### 风险 3：discover fallback 行为漂移

控制：

- 不改现有 fallback 分支条件
- 先补测试，再挪动实现

## 默认假设

- 这轮“继续 P1”指的是继续处理后端 God file，而不是切到前端公共组件
- 当前更值得优先拆的是 `public-api.ts` 中的 beans/discover，而不是 roasters 或 `catalog.ts`
