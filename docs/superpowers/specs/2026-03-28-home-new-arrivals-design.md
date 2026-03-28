# Home New Arrivals Design

**Goal:** 把小程序首页从当前的产地 Atlas 改成轻量新品页，只保留新品列表、搜索和新品筛选。

## Current State

- `apps/miniprogram/src/pages/index/index.tsx` 目前承载了 Atlas 首页，大量逻辑和“新品”目标无关。
- 现有新品数据链路已经存在：
  - 列表使用 `getBeans({ isNewArrival: true, sort: 'updated_desc' })`
  - 筛选使用 `getNewArrivalFilters(...)`
  - UI 组件可复用 `NewArrivalFilterBar` 和 `BeanCard`

## Proposed Change

- 首页改为独立的轻量新品页，不复用 `pages/all-beans/index.tsx` 的轻问答、探索路径、大洲和国家逻辑。
- 页面职责保持在 `pages/index/index.tsx`：
  - 管理搜索、筛选、分页、错误和加载状态
  - 调新品列表接口和新品筛选接口
  - 组合 `SearchBar`、`NewArrivalFilterBar`、`BeanCard`、`EmptyState`
- 提取一个小的纯函数模块，负责：
  - 组装新品列表请求参数
  - 判断当前是否存在激活筛选
  - 生成空态文案

## Scope

- 修改首页页面文件和页面样式
- 修改首页页面标题
- 增加首页新品页相关测试
- 不改 API、shared types、`pages/all-beans`

## Risks And Limits

- 如果新品筛选接口失败，页面会退回到基于首页首批新品数据的本地筛选项，这个结果可能不如远端个性化完整。
- 手动验证仍需要在微信开发者工具里确认首页 tab 的实际显示和滚动加载。
