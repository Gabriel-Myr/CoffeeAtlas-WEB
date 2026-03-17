# 项目路线图

> 截至 2026-03-15 的代码库现实快照。这里强调“已实现 / 部分实现 / 下一步”，不再保留过时的周计划口吻。

---

## 已实现

### Monorepo 与基础能力
- pnpm workspace + Turborepo 已落地
- `apps/web`、`apps/miniprogram`、`packages/shared-types`、`packages/api-client`、`packages/domain` 结构已建立
- 根级 `lint` / `typecheck` / `build` 流程可用

### Web 体验
- 首页 Atlas 产地探索页
- 全部豆款页
- 主题切换和 Atlas 风格视觉变量体系
- 开发辅助页：`geo-preview`、`geo-compare`

### v1 API
- `/api/v1/beans`
- `/api/v1/beans/[id]`
- `/api/v1/beans/discover`
- `/api/v1/roasters`
- `/api/v1/roasters/[id]`
- `/api/v1/health`
- `/api/v1/me`
- `/api/v1/me/favorites`
- `/api/v1/me/favorites/sync`
- `/api/v1/auth/wechat/login`

### 数据与鉴权基础
- 基础 SQL schema、索引、RLS、视图与函数已在 `apps/web/db/sql/**`
- `app_users` / `user_favorites` 迁移已存在
- `roaster_beans.image_url` 迁移已存在
- JWT、收藏、微信登录 server helper 已落地

### 小程序
- 页面骨架和主要页面逻辑已落地
- Beans / roasters / favorites / login 等 API client 已落地
- runtime API 地址覆盖能力已落地
- Atlas 浏览体验已在小程序首页和列表页接入

---

## 部分实现 / 进行中

### 共享层抽象
- `packages/shared-types` 已成为 v1 契约主层
- `packages/api-client` 仍只部分实现，尚未接管 miniprogram 主运行时路径
- `packages/domain` 仍较空，尚未承载主要纯领域逻辑

### 管理能力
- 已有 `/api/admin/beans` 和 `/api/admin/roasters`
- `admin-catalog.ts` 已有创建豆款与搜索 roaster 逻辑
- 但 `admin-auth.ts` 仍是 placeholder，管理能力尚未真正安全化

### 导入链路
- `import-roasters.ts`、`import-beans.ts`、`import-sales.ts` 可运行
- 但脚本安全性、参数化与可复用性仍不足

---

## 当前优先级

### P0 / 安全与一致性
1. 清理导入脚本和环境文件中的硬编码敏感值
2. 让管理接口接入真实鉴权，而不是 placeholder `requireAdmin()`
3. 收敛 v1 shared-types 与 miniprogram 本地镜像类型的重复维护

### P1 / 可维护性
4. 为导入脚本补统一 package script、参数输入和错误输出规范
5. 为更多 server helper / parser / normalizer 补测试
6. 明确 legacy `/api/beans`、`/api/roasters` 与 `/api/v1/*` 的迁移边界

### P2 / 体验与抽象
7. 逐步把稳定的跨端逻辑迁移到 `packages/api-client` / `packages/domain`
8. 继续完善 Atlas 体验与搜索/筛选一致性
9. 改善图片、价格、来源数据的标准化质量

---

## 中期方向

### API 与数据
- 更完整的管理端导入 API
- 更稳定的 product identity，减少销量导入时的模糊匹配风险
- 更明确的变更请求 / 审核流
- 质量评分与监控能力

### 前端与客户端
- 继续统一 Web 与小程序在 beans / roasters / discover 上的契约与行为
- 如果 `packages/api-client` 成熟，再把小程序逐步迁移过去
- 针对大列表与图片做性能优化

---

## 长期方向

- 用户体系增强（更完整资料、更多个人化能力）
- 收藏、评论、关注等社区能力
- 更丰富的数据可视化
- 更自动化的数据采集与同步链路

---

## 当前明确技术债

1. 历史导入脚本的敏感信息处理方式不可接受，需要尽快清理
2. 小程序类型与 shared-types 双轨维护成本高
3. 管理接口已有功能，但安全边界还没完成
4. legacy API 与 v1 API 并存，需要持续维护兼容边界
