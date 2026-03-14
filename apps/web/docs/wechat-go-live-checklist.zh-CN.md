# 微信云端联调上线清单

这份清单的目标是：让你在微信开发者工具里直接调试云端 API，而不是再卡在本地局域网环境。

## 1. 数据库准备

新库初始化顺序：

1. `apps/web/db/sql/001_extensions.sql`
2. `apps/web/db/sql/010_schema.sql`
3. `apps/web/db/sql/020_indexes.sql`
4. `apps/web/db/sql/030_rls.sql`
5. `apps/web/db/sql/040_views_and_functions.sql`
6. `apps/web/db/sql/050_seed_minimal.sql`（可选）

老库增量迁移：

1. `apps/web/db/migrations/001_app_users_and_favorites.sql`
2. `apps/web/db/migrations/002_roaster_beans_image_url.sql`

确认点：

- `public.app_users` 已存在
- `public.user_favorites` 已存在
- `public.roaster_beans.image_url` 已存在
- 不要再执行 `apps/web/db/migrations/cleanup_unused_fields.sql` 去删字段

## 2. 云端 API 环境变量

Web/API 部署环境至少需要：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_JWT_SECRET`
- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`

本地快速自检：

```bash
cd /Users/gabi/CoffeeAtlas-Web/apps/web
pnpm check:cloud-env
```

如果脚本退出码不是 0，先把缺失变量补齐再继续。

## 3. 云端 API 健康检查

部署后先访问：

```text
https://你的域名/api/v1/health
```

期望看到：

- `ok: true`
- `data.supabaseConfigured = true`
- `data.wechatConfigured = true`
- `data.jwtConfigured = true`

如果这一步不对，就先不要测登录接口。

## 4. 微信开发者工具联调

小程序里操作：

1. 打开 `我的`
2. 进入 `API 联调`
3. 填入你的云端 HTTPS 域名
4. 依次点击：
   - `健康检查`
   - `豆款列表`
   - `烘焙商列表`
5. 回到 `我的` 页执行微信登录
6. 再回 `API 联调` 测：
   - `当前用户`
   - `收藏列表`

确认点：

- 列表接口能返回数据
- 登录后 `/api/v1/me` 能拿到用户信息
- 收藏接口可读写
- API 地址显示为“云端”而不是“本地”

## 5. 终端冒烟测试

未登录态：

```bash
cd /Users/gabi/CoffeeAtlas-Web/apps/web
API_BASE_URL=https://你的域名 pnpm smoke:api
```

已登录态：

```bash
cd /Users/gabi/CoffeeAtlas-Web/apps/web
API_BASE_URL=https://你的域名 AUTH_TOKEN=<jwt> pnpm smoke:api
```

建议结果：

- `v1 health` 返回 200
- `beans list` 返回 200
- `roasters list` 返回 200
- 带 JWT 时 `current user` / `favorites` 返回 200

## 6. 常见卡点

- `health` 里 `wechatConfigured` 是 `false`：部署环境没配 `WECHAT_APP_ID` / `WECHAT_APP_SECRET`
- `health` 里 `jwtConfigured` 是 `false`：没配 `APP_JWT_SECRET`
- 小程序能打开但探针失败：联调地址不是 HTTPS，或还是本地 IP
- 登录失败：微信后台域名、AppID/Secret、部署环境变量三者不一致
- 收藏失败：数据库没跑 `app_users` / `user_favorites` 迁移

## 7. 达标标准

满足下面 5 条，就可以基本摆脱本地调试：

1. 云端 `/api/v1/health` 全绿
2. 小程序列表接口走云端正常
3. 微信登录走云端正常
4. 收藏读写走云端正常
5. `pnpm smoke:api` 能在终端复现同样结果
