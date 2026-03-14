# WeChat Cloud Debug

## Goal

Use a cloud-hosted API domain for the miniprogram so day-to-day debugging does not depend on a local LAN server.

## Database

Fresh Supabase setup:

1. `apps/web/db/sql/001_extensions.sql`
2. `apps/web/db/sql/010_schema.sql`
3. `apps/web/db/sql/020_indexes.sql`
4. `apps/web/db/sql/030_rls.sql`
5. `apps/web/db/sql/040_views_and_functions.sql`
6. `apps/web/db/sql/050_seed_minimal.sql` (optional)

Existing projects that already ran the old schema should also run:

1. `apps/web/db/migrations/001_app_users_and_favorites.sql`
2. `apps/web/db/migrations/002_roaster_beans_image_url.sql`

Notes:

- `app_users` and `user_favorites` are required for WeChat login and cloud favorites.
- `image_url` is now part of `roaster_beans`, so miniprogram cards and detail pages can keep using remote images.
- `apps/web/db/migrations/cleanup_unused_fields.sql` is intentionally a no-op now; do not use it to prune production columns.

## Required Env Vars

Set these on the deployed web/API app:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_JWT_SECRET`
- `WECHAT_APP_ID`
- `WECHAT_APP_SECRET`

Miniprogram build/runtime:

- `TARO_APP_API_URL=https://your-cloud-domain.com`

## Miniprogram Debug Flow

1. Open the miniprogram `我的` page.
2. Tap `API 联调`.
3. Fill in the cloud API domain, for example `https://your-cloud-domain.com`.
4. Run probes in this order:
   - `健康检查`
   - `豆款列表`
   - `烘焙商列表`
   - login on `我的`
   - back to `API 联调` and run `当前用户` / `收藏列表`

`API 联调` stores the override URL only on the current device/devtools session, so you can switch between staging and production without rebuilding.

## CLI Smoke Test

Use the same cloud domain from the terminal:

```bash
cd apps/web
API_BASE_URL=https://your-cloud-domain.com pnpm smoke:api
```

If you already have a JWT from the login API:

```bash
cd apps/web
API_BASE_URL=https://your-cloud-domain.com AUTH_TOKEN=<jwt> pnpm smoke:api
```
