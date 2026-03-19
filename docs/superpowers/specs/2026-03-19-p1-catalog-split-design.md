# P1 Catalog Split Design

**Goal:** 在不改动现有调用方行为的前提下，把 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts` 从 God file 拆成几个职责明确的模块，同时保留 `catalog.ts` 作为兼容入口。

## 现状

- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts` 当前 659 行。
- 文件里混着 5 类职责：
  - beans / roasters 对外类型
  - row -> app model mapper
  - sample fallback
  - Supabase beans 查询、计数、搜索
  - Supabase roasters 查询、聚合
- 现有调用方主要都 import `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts`：
  - Web 页面里的 `CoffeeBean` 类型
  - `public-api.ts`
  - `favorites-api.ts`
  - `new-arrival-filters-service.ts`
  - `public-beans.ts` / `public-bean-discover.ts` 里的动态 import

## 方案选择

### 方案 A（采用）

把实现拆成 4 个 focused module，再让 `catalog.ts` 做兼容门面：

- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog-types.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog-core.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog-beans.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog-roasters.ts`
- `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts` 只保留类型和公开函数 re-export

这样可以先把最重的查询/mapper/fallback 逻辑拆开，同时不要求调用方立刻改 import。

### 不采用的方案

- 继续把函数留在 `catalog.ts` 里，只做注释或分段
  - 文件看起来会整齐一点，但维护边界没有真正改善
- 一次性拆成 5~6 个更细的模块
  - 这一轮范围过大，容易把 fallback、动态 import、查询依赖一起拆乱
- 顺手把消费者 import 一起改成新模块路径
  - 当前收益不大，反而会扩大 diff 和回归面

## 目标边界

这轮只做结构重排和小的内部去重，不做产品行为修改：

- 保持 `catalog.ts` 的现有导出名不变
- 保持 beans / roasters / search 的返回结构不变
- 保持 Supabase 优先、sample fallback 兜底策略不变
- 不改 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/public-beans.ts` 的对外行为
- 不改小程序或 Web 页面调用方式

## 模块设计

### 1. `catalog-types.ts`

职责：

- 承接 `catalog.ts` 当前公开类型：
  - `CoffeeBean`
  - `Roaster`
  - `CatalogBeanFilters`
  - `CatalogBeansQuery`
  - `RoastersQuery`

约束：

- 只放对外公开类型和 query/filter type
- 不放运行时实现
- `catalog.ts` 只从这里 re-export 类型，避免新模块反向依赖 facade

### 2. `catalog-core.ts`

职责：

- 定义并导出内部 row type / aggregate type
- 维护共享小工具：
  - `toNumber`
  - `normalizeOptionalString`
  - `createCatalogError`
- 承接 mapper：
  - `mapCoffeeBean`
  - `mapRoaster`
- 承接 sample fallback：
  - `mapSampleCatalogRow`
  - `getSampleBeans`

约束：

- 只放平台无关、无业务流程状态的共享逻辑
- 不依赖 `catalog.ts`，避免门面反向依赖
- 允许直接依赖：
  - `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog-types.ts`
  - `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/sales.ts`
  - `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/sample-data.ts`

### 3. `catalog-beans.ts`

职责：

- beans 查询和 fallback：
  - `getCatalogBeans`
  - `getCatalogBeansPage`
  - `countCatalogBeans`
  - `getBeanById`
  - `getCatalogBeansByIds`
  - `searchCatalogBeans`
  - `countSearchCatalogBeans`
- beans 私有 helper：
  - `resolveBeanIdsForFilters`
  - `fetchBeanContext`

依赖：

- 只依赖 `catalog-types.ts`、`catalog-core.ts`、`new-arrivals.ts`、`supabase.ts`
- 不依赖 `catalog.ts`

### 4. `catalog-roasters.ts`

职责：

- roasters 查询和聚合：
  - `getRoasterPage`
  - `getRoasters`
  - `countRoasters`
  - `getRoasterById`
  - `getRoastersByIds`
- roaster 私有 helper：
  - `fetchRoasterAggregates`
  - `queryRoasterRows`
  - `resolveRoasterCollection`
  - feature 过滤逻辑

依赖：

- 只依赖 `catalog-types.ts`、`catalog-core.ts` 和 `supabase.ts`
- 不依赖 `catalog.ts`

### 5. `catalog.ts`

职责收敛为：

- 从 `catalog-types.ts` 导出 `CoffeeBean`、`Roaster`、query/filter type
- re-export beans / roasters 公开函数

约束：

- 不保留大段实现
- 只做兼容门面，避免再长回去

## 数据流

### Beans 读取

1. 调用方继续 import `catalog.ts`
2. `catalog.ts` 转发到 `catalog-beans.ts`
3. `catalog-beans.ts` 走：
   - Supabase 查询路径，或
   - sample fallback 路径
4. 共享 mapper / sample helper 由 `catalog-core.ts` 提供

### Roasters 读取

1. 调用方继续 import `catalog.ts`
2. `catalog.ts` 转发到 `catalog-roasters.ts`
3. `catalog-roasters.ts` 完成 query + aggregate + feature filter
4. `catalog-core.ts` 提供 `mapRoaster`

## 测试策略

这轮测试重点是“拆分后兼容 + 共享纯逻辑稳定”：

- 新增 `/Users/gabi/CoffeeAtlas-Web/apps/web/tests/catalog-core.test.ts`
  - 锁定 beans/roaster mapper 和 sample fallback 纯逻辑
- 新增 `/Users/gabi/CoffeeAtlas-Web/apps/web/tests/catalog-exports.test.ts`
  - 锁定 `catalog.ts` 仍暴露现有公开入口
  - 只看导出契约，不绑定具体实现文件路径
- 新增 `/Users/gabi/CoffeeAtlas-Web/apps/web/tests/catalog-contract.typecheck.ts`
  - 锁定 `catalog.ts` 的类型导出仍可被消费者使用
  - 显式覆盖 `CoffeeBean`、`Roaster`、`CatalogBeanFilters`、`CatalogBeansQuery`、`RoastersQuery`
  - 显式覆盖 `getRoasters` 的 overload 仍能通过 typecheck
- 保持现有 Web test/typecheck/lint 全量验证

## 风险与控制

### 风险 1：拆分后循环依赖

控制：

- `catalog.ts` 只做门面
- `catalog-beans.ts` / `catalog-roasters.ts` 只依赖 `catalog-types.ts` + `catalog-core.ts`
- 新模块禁止反向 import `catalog.ts`

### 风险 2：sample fallback 行为漂移

控制：

- `getSampleBeans()` 集中放到 `catalog-core.ts`
- 先补纯逻辑测试，再移动实现

### 风险 3：外部 import 断裂

控制：

- 不改调用方 import
- `catalog.ts` 保持现有导出名

### 风险 4：beans/search 和 roaster 逻辑拆得过散

控制：

- 这一轮只拆 3 个实现模块
- 不顺手做更细粒度目录重构

## 默认假设

- 这轮“继续 P1”指的是继续处理下一个 God file，即 `/Users/gabi/CoffeeAtlas-Web/apps/web/lib/catalog.ts`
- 当前更重要的是先把 `catalog.ts` 变成兼容门面，而不是立刻推动所有调用方改成新模块路径
