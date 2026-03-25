# 导入与数据运维脚本规范

> 这里记录的是 `apps/web/scripts/**` 的当前现实，以及新增/修改脚本时应遵守的约束。

---

## 当前脚本清单

| 文件 | 作用 | 当前状态 |
|------|------|----------|
| `import-roasters.ts` | 批量插入 roasters 基础数据 | 可运行，但有历史安全债 |
| `import-beans.ts` | 插入 beans 与 roaster_beans 关联 | 可运行，但有历史安全债 |
| `import-sales.ts` | 从 Excel 导入销量/价格/图片 | 强依赖本地文件路径 |
| `smoke-v1.mjs` | 对 `/api/v1/*` 做基础 smoke | 已有 package script |
| `check-cloud-env.mjs` | 检查云端环境变量完整度 | 已有 package script |
| `test-surge-supabase.mjs` | 本地网络/代理联调脚本 | 偏诊断用途 |

---

## 目录与执行现实

脚本位于：
- `/Users/gabi/CoffeeAtlas-Web/apps/web/scripts/`

当前 package.json 里已经封装的命令：

```bash
cd apps/web
pnpm smoke:api
pnpm check:cloud-env
```

导入脚本目前**没有统一 npm script 包装**。执行前需确认本地 TypeScript runner；不要在 Trellis 文档里假设仓库已经标准化好了 `tsx` 入口。

---

## 当前导入脚本现实

### `import-roasters.ts`
- 直接创建 Supabase client
- 维护一大批静态 roaster seed 数据
- 当前脚本仍带有 fallback URL / key

### `import-beans.ts`
- 直接创建 Supabase client
- 同时写入 `beans` 与 `roaster_beans`
- 使用本地映射表、去重逻辑和手工产品配置
- 当前脚本仍带有 fallback URL / key

### `import-sales.ts`
- 读取本地 Excel
- 用商品名模糊匹配 `roaster_beans.display_name`
- 回写 `sales_count`、`price_amount`、`image_url`
- 当前脚本仍带有 fallback URL / key
- 还依赖绝对路径 Excel 文件，属于明显技术债

---

## 新脚本与后续修改规则

### 必须遵守

1. 敏感配置只从环境变量读取
2. 不再新增 fallback service-role key
3. 输入文件路径改为参数或环境变量，不写死个人机器绝对路径
4. 出错时打印清晰上下文并非 0 退出
5. 运行前先说明会改哪些表/字段

### 推荐模式

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}
```

不要继续复制当前历史脚本里“env 缺失就回退到硬编码值”的做法。

---

## 与数据层的关系

这些脚本写入的主要对象包括：
- `roasters`
- `beans`
- `roaster_beans`
- `app_users` / `user_favorites`（当前脚本未直接写，但相关 schema 已存在）

查询/字段契约变动后，记得同步：
- `/Users/gabi/CoffeeAtlas-Web/.trellis/spec/data-layer.md`
- `/Users/gabi/CoffeeAtlas-Web/.trellis/spec/web/backend/database-guidelines.md`
- `/Users/gabi/CoffeeAtlas-Web/.trellis/spec/database-schema.md`

---

## API 运维脚本

### `smoke-v1.mjs`
用途：
- 检查 `/api/v1/health`
- 检查 beans / roasters 列表
- 可选检查 `me` / `favorites`

环境变量：
- `API_BASE_URL`
- `AUTH_TOKEN`（可选）

### `check-cloud-env.mjs`
用途：
- 检查 cloud 环境变量是否齐全
- 输出 API smoke 提醒

关注的 key：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_JWT_SECRET`
- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`
- `TARO_APP_API_URL`（可选）

---

## 当前技术债清单

1. 三个导入脚本都仍含硬编码 fallback 凭据
2. `import-sales.ts` 依赖个人下载目录里的 Excel 文件
3. 导入脚本还没有统一 package script 和参数规范
4. 模糊匹配更新销量有误命中风险，后续应逐步过渡到更稳定的 product identity

Trellis 应把这些视为“待修问题”，不是“推荐实践”。
