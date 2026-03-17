# Backend Quality Guidelines

---

## Required Commands

按改动范围执行真实命令：

```bash
pnpm lint
pnpm typecheck
pnpm --filter coffeestories-webdb test
```

如果只改了小程序，不需要跑 web test；如果改了 `apps/web/lib/server/**`、`apps/web/app/api/**`、`apps/web/lib/catalog.ts`，至少跑 web test。

API 改动后，若本地或预览环境可访问，再补：

```bash
cd apps/web
API_BASE_URL=http://127.0.0.1:3000 pnpm smoke:api
```

---

## Route Placement Rules

- 对外 API：放在 `apps/web/app/api/v1/**`
- 旧兼容接口：只在已有 `apps/web/app/api/beans` / `roasters` / `health` 中维护
- route handler 只做参数解析、鉴权、调用 service、包装响应
- 复杂查询和业务组装放到 `apps/web/lib/server/**` 或 `apps/web/lib/catalog.ts`

不要把大段 SQL 拼装、鉴权、DTO 映射全部堆进 `route.ts`。

---

## Security Rules

- `SUPABASE_SERVICE_ROLE_KEY` 只能在服务端使用
- Bearer 鉴权统一走 `requireUser()`，不要手写多套 token 解析
- 微信 secret 只在 `wechat-auth.ts` 等服务端模块读取
- 管理员能力在真实鉴权接入前都必须标成 placeholder / restricted，不能伪装成正式安全能力

---

## Compatibility Rules

- 小程序和新客户端默认使用 `/api/v1/*`
- 旧 `/api/beans`、`/api/roasters` 是兼容层，除非明确迁移，不要直接删
- 改 shared response contract 时，要同步检查：
  - `packages/shared-types/**`
  - `apps/miniprogram/src/services/api.ts`
  - `apps/miniprogram/src/types/index.ts`
  - `packages/api-client/**`（如果相关）

---

## Manual Verification

- beans / roasters 列表：确认分页字段、筛选字段和旧参数兼容（`limit` -> `pageSize`）
- auth / favorites：确认未登录为 401、已登录可读写、sync 去重正常
- health：确认 `supabaseConfigured` / `wechatConfigured` / `jwtConfigured` 状态与环境一致
- admin helper：至少验证参数归一化和重复检测逻辑，不要只看 happy path
