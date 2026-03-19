# P2 Search SQL Dedup Design

## Goal

把 `public.search_catalog(...)` 和 `public.search_catalog_count(...)` 目前重复维护的搜索匹配 SQL 收拢到一个内部共享入口，避免后续再改搜索条件时两边漂移。

## Current Problem

- `search_catalog` 和 `search_catalog_count` 现在都各自维护一份：
  - `ACTIVE`
  - `roasters.is_public = true`
  - `beans.is_public = true`
  - `tsquery` 命中
  - `similarity` 阈值
- 这轮 P2-1 已经把 Web 侧列表与计数语义对齐，但 SQL 层仍有重复实现。
- 如果后面再改搜索条件，列表和计数很容易再次分叉。

## Constraints

- 不改 `public.search_catalog(...)` 的签名、参数名、返回列。
- 保持 `public.search_catalog_count(...)` 的外部契约不变。
- 不改 Web 层 `catalog-beans.ts` 的调用方式，除非实现需要最小同步。
- 不重写历史 migration `004_search_catalog_count.sql`。
- 新增增量 migration 处理 SQL 重构。

## Proposed Design

新增一个内部共享函数，例如 `public.search_catalog_matches(p_query text)`：

- 返回搜索匹配结果的完整中间集
- 同时携带：
  - `roaster_bean_id`
  - 搜索结果需要的展示列
  - `rank_score`
  - `updated_at`（用于排序）
- 对空查询也返回公开 catalog 的完整结果集，`rank_score = 0`

然后：

- `public.search_catalog(...)`
  - 只负责 `limit / offset / order by`
  - 从 `search_catalog_matches(...)` 读取并裁剪返回列
- `public.search_catalog_count(...)`
  - 只负责 `count(*)`
  - 直接基于 `search_catalog_matches(...)`

## Test Strategy

由于当前测试不依赖真实 Supabase，本轮测试重点放在两层：

1. 行为回归
   - 现有 `catalog-search.test.ts` 继续保证 Web 侧列表/计数语义稳定
2. 结构防漂移
   - 新增 SQL 结构测试，直接读取 SQL 文件，确认：
     - 存在共享 helper
     - `search_catalog` 和 `search_catalog_count` 都委托给共享 helper
     - `setup.sql` 与增量 migration 一致落地

## Non-Goals

- 不在这轮引入真实数据库集成测试
- 不调整全文搜索权重或 similarity 阈值
- 不改公开 API 响应结构
