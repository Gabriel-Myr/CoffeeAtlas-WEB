# 豆子详情页增强 + 徽章系统升级

> 最后更新：2026-04-15

---

## 项目背景

CoffeeAtlas 微信小程序已完成核心功能（豆子浏览、筛选、收藏、烘焙师详情）。当前阶段需要提升两个关键体验：

1. **豆子详情页**：补齐购买转化链路（淘宝跳转）、增强烘焙师信息展示、加入社交分享
2. **徽章系统**：从 6 枚基础徽章扩展到 14 枚，新增咖啡知识探索/购买行为/社交分享三个维度，服务端持久化

---

## 目标

1. 用户在详情页可一键复制淘宝购买链接，完成"浏览→购买"闭环
2. 用户可将豆子分享给微信好友，带动社交传播
3. 徽章系统更丰富有趣（14 枚、有梗文案），激励用户持续探索和互动
4. 徽章数据服务端持久化，跨设备不丢失

---

## 架构概览

```
微信小程序 (Taro)  ──>  apps/api (/api/v1/)  ──>  Supabase

新增数据流：
  DB(roaster_beans.product_url) → API mapper → shared-types → 详情页 → 购买按钮
  本地指标采集 → BadgeMetricSnapshot → badge definitions → UI + sync API → user_badge_progress 表
```

---

## 功能一：豆子详情页增强

### F1.1 购买链接打通

**现状**：数据库 `roaster_beans.product_url` 已存储淘宝/天猫/小红书等购买链接，但 API 层未将此字段映射到前端类型。

**需求**：将 `product_url` 从 DB 传递到详情页，用户点击"去购买"按钮后复制链接到剪贴板。

**改动链路**：

| 层级 | 文件 | 改动说明 |
|------|------|----------|
| 共享类型 | `packages/shared-types/src/catalog/index.ts` | `CatalogBeanDetail` 新增 `productUrl: string \| null` |
| DB view | `apps/api/db/sql/010_schema.sql` → `v_catalog_active` | 确认 view 已包含 `product_url`（已有） |
| API 映射 | `apps/api/lib/catalog-beans.ts` | bean detail 映射函数读取 `product_url`，输出 `productUrl` |
| 小程序类型 | `apps/miniprogram/src/types/index.ts` | `BeanDetail` 新增 `productUrl?: string \| null` |
| 详情页 | `apps/miniprogram/src/pages/bean-detail/index.tsx` | 底部固定栏 + 购买按钮 |

**交互方式**：复制链接到剪贴板（复用已有 `openExternalLink()` 工具函数），提示用户"链接已复制，请前往淘宝打开"。

**边界情况**：
- `productUrl` 为空时：隐藏"去购买"按钮，仅显示价格
- `productUrl` 非淘宝域名时：按钮文案改为"去购买"（通用）

---

### F1.2 烘焙师信息增强

**现状**：详情页烘焙师区域仅显示 `roasterName` + `city`，信息量不足。

**需求**：烘焙师区域改为可点击卡片，展示更丰富信息，引导用户前往烘焙师详情页。

**数据扩展**：

`CatalogBeanDetail` 新增字段：

| 字段 | 类型 | 来源 |
|------|------|------|
| `roasterLogoUrl` | `string \| null` | `roasters.logo_url` |
| `roasterDescription` | `string \| null` | `roasters.description` |

**UI 设计**：

```
┌───────────────────────────────────────┐
│  [Logo]  烘焙师名称              >    │
│          城市 · 描述（1行截断）        │
└───────────────────────────────────────┘
```

- 点击跳转 `/pages/roaster-detail/index?id=${bean.roasterId}`
- 无 logo 时显示首字母头像（与 Profile 页风格一致）

---

### F1.3 微信分享

**需求**：用户可从详情页将豆子分享给微信好友或朋友圈。

**实现方式**：

| 功能 | 微信 API | 说明 |
|------|----------|------|
| 分享给好友 | `useShareAppMessage` | 分享卡片标题：`[烘焙师名] · [豆名]`，图片：`bean.imageUrl` |
| 分享到朋友圈 | `useShareTimeline` | 标题同上 |
| 分享按钮 | `<Button openType="share">` | 底部栏左侧，与收藏并排 |

**分享事件记录**（用于徽章指标）：
- 每次触发 `onShareAppMessage` 时，写入本地存储 `share_event_log`
- 记录格式：`{ beanId: string, ts: number }`

**海报生成（v2 后续迭代，本期不做）**：
- Canvas 绘制包含豆子信息 + 小程序码的图片
- 保存到相册后可发朋友圈

---

### F1.4 详情页底部固定栏

**需求**：将收藏、分享、价格、购买整合到底部固定操作栏，提升操作效率。

**布局**：

```
┌──────────────────────────────────────────┐
│  [♡ 收藏]  [↗ 分享]  │  ¥128  [去购买] │
└──────────────────────────────────────────┘
```

**规格**：
- 高度：约 100rpx + 底部安全区（`env(safe-area-inset-bottom)`）
- 左区：收藏按钮（icon + 文字）+ 分享按钮（icon + 文字）
- 右区：价格显示 + 购买 CTA 按钮
- 收藏按钮从英雄图区域迁移至此
- 购买 CTA 使用主题强调色

**说明**：此布局为初版方案，实现后根据视觉效果可能调整。收藏按钮是否保留在英雄图区域待看效果决定。

---

## 功能二：徽章系统升级

### F2.1 完整徽章清单

#### 保留原有 6 枚

| # | ID | 标题 | 维度 | 指标 | 门槛 |
|---|---|---|---|---|---|
| 01 | `visitor` | 入馆访客 | 登录 | `loggedIn` | 1 |
| 02 | `bean-starter` | 豆单初藏 | 收藏 | `beanFavorites` | 1 |
| 03 | `bean-collector` | 豆单收藏家 | 收藏 | `beanFavorites` | 5 |
| 04 | `roaster-radar` | 烘焙雷达 | 收藏 | `roasterFavorites` | 1 |
| 05 | `history-explorer` | 风味漫游者 | 浏览 | `historyCount` | 3 |
| 06 | `history-regular` | 探索常客 | 浏览 | `historyCount` | 10 |

#### 新增 — 咖啡知识探索（4 枚）

| # | ID | 标题 | subtitle | 指标 | 门槛 | 解锁文案 |
|---|---|---|---|---|---|---|
| 07 | `origin-scout` | 产地侦察兵 | 探索 3 个不同产地 | `uniqueCountries` | 3 | "你的咖啡护照已盖了 3 个章" |
| 08 | `origin-atlas` | 风味地图师 | 足迹覆盖 3 个大洲 | `continentsCovered` | 3 | "亚非拉美洲，你的味蕾比联合国还忙" |
| 09 | `process-nerd` | 处理法极客 | 尝试 4 种不同处理法 | `uniqueProcesses` | 4 | "水洗日晒蜜处理厌氧，四大天王已集齐" |
| 10 | `variety-hunter` | 品种猎人 | 接触 3 种不同品种 | `uniqueVarieties` | 3 | "在咖啡基因库里翻箱倒柜的人" |

#### 新增 — 购买行为（2 枚）

| # | ID | 标题 | subtitle | 指标 | 门槛 | 解锁文案 |
|---|---|---|---|---|---|---|
| 11 | `first-click` | 剁手初体验 | 首次点击购买链接 | `purchaseClicks` | 1 | "钱包已就位，就差付款了" |
| 12 | `multi-roaster` | 不忠实消费者 | 查看 3 家不同烘焙师的购买链接 | `uniqueRoasterPurchaseClicks` | 3 | "货比三家的精明买手，烘焙师们都慌了" |

#### 新增 — 社交分享（2 枚）

| # | ID | 标题 | subtitle | 指标 | 门槛 | 解锁文案 |
|---|---|---|---|---|---|---|
| 13 | `first-share` | 安利达人 | 首次把豆子分享给好友 | `shareCount` | 1 | "你朋友圈终于有了咖啡味" |
| 14 | `serial-sharer` | 种草机器 | 累计分享 5 次 | `shareCount` | 5 | "非官方咖啡推广大使，请领工牌" |

---

### F2.2 指标追踪系统

**扩展 BadgeMetricSnapshot 接口**：

```typescript
interface BadgeMetricSnapshot {
  // 现有
  loggedIn: boolean;
  beanFavorites: number;
  roasterFavorites: number;
  historyCount: number;
  // 新增 — 知识探索
  uniqueCountries: number;
  uniqueProcesses: number;
  uniqueVarieties: number;
  continentsCovered: number;
  // 新增 — 购买行为
  purchaseClicks: number;
  uniqueRoasterPurchaseClicks: number;
  // 新增 — 社交
  shareCount: number;
}
```

**指标数据来源**：

| 指标 | 数据源 | 采集方式 |
|------|--------|----------|
| `uniqueCountries` | 浏览历史 | 从 `coffee_history` 中提取 `originCountry`，Set 去重 |
| `uniqueProcesses` | 浏览历史 | 从 `coffee_history` 中提取 `process`，Set 去重 |
| `uniqueVarieties` | 浏览历史 | 从 `coffee_history` 中提取 `variety`，Set 去重 |
| `continentsCovered` | 浏览历史 | 从 `originCountry` 映射大洲，复用 `origin-atlas.ts` |
| `purchaseClicks` | 新增本地存储 | 点击购买按钮时写入 `purchase_click_log` |
| `uniqueRoasterPurchaseClicks` | 新增本地存储 | 从 `purchase_click_log` 中提取 `roasterId`，Set 去重 |
| `shareCount` | 新增本地存储 | 分享回调时写入 `share_event_log` |

**新增本地存储 Key**：

| Key | 类型 | 说明 |
|-----|------|------|
| `purchase_click_log` | `{ roasterId: string; beanId: string; ts: number }[]` | 购买点击记录 |
| `share_event_log` | `{ beanId: string; ts: number }[]` | 分享事件记录 |
| `exploration_set` | `{ countries: string[]; processes: string[]; varieties: string[] }` | 累计去重集合，不受历史 20 条上限影响 |

**HistoryItem 扩展**：

现有 `HistoryItem` 缺少 `originCountry`、`process`、`variety` 字段。需要在 `addToHistory()` 时额外保存这些字段，同时更新 `exploration_set`。

**向后兼容**：旧版历史记录缺少新字段，计算时 `filter(Boolean)` 跳过空值。`exploration_set` 为独立存储，首次计算时从已有历史初始化。

---

### F2.3 服务端持久化

**新建数据库表**：

```sql
CREATE TABLE user_badge_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  badge_id    text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_user_badge_progress_user
  ON user_badge_progress(user_id);
```

**新增 API 端点**：

| 方法 | 路径 | 请求体 | 响应 | 说明 |
|------|------|--------|------|------|
| GET | `/api/v1/me/badges` | — | `{ badgeIds: string[] }` | 获取已解锁徽章 ID 列表 |
| POST | `/api/v1/me/badges/sync` | `{ badgeIds: string[] }` | `{ synced: number }` | 批量同步新解锁徽章（幂等） |

**同步逻辑**：

1. 客户端每次打开 Profile 页时计算所有徽章状态
2. 对比本地已知解锁列表，找出新解锁的 badge_id
3. 用户已登录时，调用 `POST /api/v1/me/badges/sync` 上传新解锁列表
4. 服务端执行 `INSERT ... ON CONFLICT (user_id, badge_id) DO NOTHING`（幂等）
5. 用户登录时调用 `GET /api/v1/me/badges` 拉取服务端列表，与本地合并

**设计决策**：
- 客户端计算 + 结果同步（非服务端计算），因为指标来源分散在本地存储中
- 服务端只存"谁在什么时候解锁了什么"，不存指标快照

---

### F2.4 徽章 SVG 设计规范

**技术规格**：

| 属性 | 规格 |
|------|------|
| 尺寸 | 96 × 96 px（@2x），SVG 格式 |
| 状态 | 2 态：locked（灰调 / 线稿）、unlocked（全彩） |
| 风格 | 线条 + 平涂，简约有手绘感，有收集感和梗 |
| 工具 | Quiver 生成 |
| 存放 | `apps/miniprogram/src/assets/badges/{badge-id}.svg` |

**配色方案**（与现有主题一致）：

| 用途 | 色值 | 说明 |
|------|------|------|
| 已解锁主色 | `#8B5A2B` | 咖啡棕 |
| 已解锁强调色 | `#c85c3d` | 赭石红（与收藏心形同色） |
| 已解锁背景 | `#FAF5F0` | 暖白 |
| 未解锁线条 | `rgba(107,83,68,0.3)` | 淡棕 |
| 未解锁填充 | `rgba(107,83,68,0.08)` | 极淡棕 |
| 点亮光晕 | `rgba(200,92,61,0.15)` | 赭石光晕 |

**各维度主题意象**（Quiver 参考）：

| 维度 | 意象 | 示例元素 |
|------|------|----------|
| 登录 / 基础 | 博物馆 / 入馆 | 门票、钥匙、馆藏印章 |
| 收藏 | 收集 / 归档 | 书架、文件夹、心形邮票 |
| 浏览 | 旅行 / 探索 | 地球仪、望远镜、脚印 |
| 产地知识 | 地图 / 护照 | 护照盖章、世界地图碎片、大洲轮廓 |
| 处理法 | 实验室 / 炼金 | 烧杯、试管、齿轮 |
| 品种 | 自然 / 狩猎 | 放大镜、咖啡樱桃、DNA 螺旋 |
| 购买 | 购物 / 钱包 | 购物车、钱包、快递箱 |
| 社交 | 传播 / 连接 | 纸飞机、信封、扩音器 |

**状态过渡实现**：
- locked 态通过 CSS filter 实现：`filter: grayscale(1) opacity(0.4)`
- unlocked 态：`filter: none`（显示 SVG 原色）
- 解锁瞬间：CSS keyframe scale bounce 动画（约 0.3s）

---

### F2.5 Profile 页徽章区改造

**现状**：6 枚徽章 2 列平铺。扩展到 14 枚后需要重新组织。

**方案：按维度分组**

```
┌─ 馆藏阁 ─────────────────────────────────┐
│  已解锁 5/14                              │
│                                           │
│  ── 入馆基础 (3/3) ──                     │
│  [visitor]  [bean-starter]  [bean-collector]
│                                           │
│  ── 探索足迹 (2/2) ──                     │
│  [roaster-radar]  [history-explorer]       │
│  [history-regular]                         │
│                                           │
│  ── 咖啡知识 (0/4) ──                     │
│  [origin-scout]  [origin-atlas]            │
│  [process-nerd]  [variety-hunter]          │
│                                           │
│  ── 购买行为 (0/2) ──                     │
│  [first-click]  [multi-roaster]            │
│                                           │
│  ── 社交分享 (0/2) ──                     │
│  [first-share]  [serial-sharer]            │
└───────────────────────────────────────────┘
```

- 每组标题用小字母标签（延续 "Collection Cabinet" 风格）
- 组标题右侧显示该组解锁进度
- 徽章卡片改为 3 列布局（14 枚更紧凑）
- 保留点击弹出 modal 查看详情的交互

**分组定义**：

| 组 ID | 组标题 | 包含徽章 |
|-------|--------|----------|
| `basics` | 入馆基础 | visitor, bean-starter, bean-collector |
| `exploration` | 探索足迹 | roaster-radar, history-explorer, history-regular |
| `knowledge` | 咖啡知识 | origin-scout, origin-atlas, process-nerd, variety-hunter |
| `purchase` | 购买行为 | first-click, multi-roaster |
| `social` | 社交分享 | first-share, serial-sharer |

---

### F2.6 解锁通知

当 Profile 页检测到新徽章解锁时，自动弹出通知 modal：

```
┌─────────────────────────┐
│                         │
│     [徽章 SVG 图标]      │
│                         │
│   恭喜解锁新徽章！       │
│   「产地侦察兵」         │
│                         │
│   你的咖啡护照已盖了     │
│   3 个章                │
│                         │
│      [ 知道了 ]         │
└─────────────────────────┘
```

- 复用现有 badge modal 样式
- 首次出现时自动弹出
- 多个新徽章时依次弹出或合并为一个摘要

---

## 实现计划

### 阶段划分

| 阶段 | 内容 | 涉及层级 | 依赖 | 预估文件数 |
|------|------|----------|------|-----------|
| **P1** | 打通 productUrl（类型→API→前端） | shared-types, api, miniprogram | 无 | 4 |
| **P2** | 详情页底部固定栏 + 购买按钮 | miniprogram | P1 | 2 |
| **P3** | 微信分享功能 | miniprogram | 无 | 2 |
| **P4** | 烘焙师信息增强（可点击卡片） | shared-types, api, miniprogram | 无 | 4 |
| **P5** | HistoryItem 扩展 + exploration_set | miniprogram | 无 | 3 |
| **P6** | 本地指标追踪（购买点击 + 分享事件） | miniprogram | P2, P3 | 2 |
| **P7** | 新徽章定义 + BadgeMetricSnapshot 扩展 | miniprogram | P5, P6 | 2 |
| **P8** | SVG 徽章资源制作 | 设计（手动） | P7 清单 | 14 SVG |
| **P9** | 服务端：新建表 + badge API | api, db | 无（可并行） | 4 |
| **P10** | Profile 页徽章区改造（分组 + SVG） | miniprogram | P7, P8, P9 | 3 |
| **P11** | 解锁通知 + 同步逻辑 | miniprogram | P9, P10 | 2 |

### 并行策略

```
P1 ──> P2 ──┐
             ├──> P6 ──> P7 ──┐
P3 ─────────┘                  │
                               ├──> P10 ──> P11
P4（独立）                      │
P5（独立） ───────────────────┘
P8（手动，并行） ──────────────┘
P9（独立，可并行） ────────────┘
```

---

## 涉及文件清单

### 共享类型层

| 文件 | 改动 |
|------|------|
| `packages/shared-types/src/catalog/index.ts` | `CatalogBeanDetail` 新增 productUrl, roasterLogoUrl, roasterDescription |

### API 层

| 文件 | 改动 |
|------|------|
| `apps/api/lib/catalog-beans.ts` | bean detail 映射加入 product_url, logo_url, description |
| `apps/api/db/migrations/xxx_add_badge_progress.sql` | 新建 `user_badge_progress` 表 |
| `apps/api/lib/server/badge-api.ts` | 新建：badge GET + sync 逻辑 |
| `apps/api/app/api/v1/me/badges/route.ts` | 新建：GET/POST 路由 |

### 小程序层

| 文件 | 改动 |
|------|------|
| `apps/miniprogram/src/types/index.ts` | BeanDetail 新增字段 |
| `apps/miniprogram/src/pages/bean-detail/index.tsx` | 底部栏、烘焙师卡片、分享 |
| `apps/miniprogram/src/pages/bean-detail/index.scss` | 底部栏样式 |
| `apps/miniprogram/src/pages/profile/profile-badges.ts` | 新徽章定义 + 指标扩展 |
| `apps/miniprogram/src/pages/profile/badge-record.ts` | 分组结构、新文案 |
| `apps/miniprogram/src/pages/profile/index.tsx` | 徽章区分组布局 + 解锁通知 |
| `apps/miniprogram/src/pages/profile/index.scss` | 分组 + 3 列布局样式 |
| `apps/miniprogram/src/utils/storage.ts` | HistoryItem 扩展、新增 purchase/share 存储函数 |
| `apps/miniprogram/src/services/api.ts` | 新增 badge API 调用 |
| `apps/miniprogram/src/assets/badges/*.svg` | 14 个徽章 SVG 文件 |

---

## 已知风险与缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| 浏览历史上限 20 条，知识探索徽章依赖多样性数据 | 用户活跃一段时间后旧多样性数据被覆盖 | 新增独立 `exploration_set` 存储，只追加不限量 |
| 旧版 HistoryItem 无 originCountry/process/variety | 升级后旧数据无法贡献知识徽章 | 首次初始化时从已有历史提取（如有字段），`filter(Boolean)` 跳过空值 |
| 微信分享回调不保证用户真的发送了 | shareCount 可能虚高 | 微信平台限制，接受近似计数 |
| 14 枚徽章 2 列排布过长 | 页面滚动体验差 | 改为 3 列 + 分组折叠 |
| 底部固定栏遮挡内容 | 详情页底部内容被遮挡 | 页面底部加 padding 等于固定栏高度 |

---

## 明确不做（Out of Scope）

- 积分 / 排行榜系统
- 每日签到 / 连续登录
- 海报生成（v2 后续）
- 徽章 3D / 粒子特效
- 服务端指标计算
- 跳转淘宝小程序（使用复制链接方案）
- 评论 / 评分功能
