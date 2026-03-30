# Quality Guidelines

---

## Required Commands

按改动范围执行，默认先看小程序：

```bash
pnpm lint
pnpm typecheck
pnpm --filter @coffeeatlas/miniprogram typecheck
pnpm --filter @coffeeatlas/miniprogram test
```

如果改了 API server/helper、共享契约或可测试的纯函数，再补：

```bash
pnpm --filter @coffeeatlas/api test
```

API 改动且有可访问环境时，再补：

```bash
cd apps/api && API_BASE_URL=http://127.0.0.1:3000 pnpm smoke:api
```

---

## Frontend Reality Rules

### Miniprogram
- 用户态 `/api/v1/*` 请求集中在 `src/services/api.ts`
- 目录数据读取集中在 `src/services/catalog-supabase.ts`
- API 地址覆盖与联调提醒集中在 `src/utils/api-config.ts`
- Supabase 环境读取与 fetch 适配集中在 `src/utils/supabase.ts`
- 收藏、token、历史记录集中在 `src/utils/storage.ts`
- tab 间入口语义优先复用 `entry-intent`
- 页面加载与分页要防止并发请求覆盖（参考 `all-beans/index.tsx` 的 request version 模式）
- 本地联调默认优先使用 `pnpm dev:miniprogram:auto`，它会监听 `apps/miniprogram`、`packages/shared-types`、`packages/api-client`、`packages/domain` 的改动，并自动重推 `dev:weapp`
- 目录页联调前，先确认 `TARO_APP_SUPABASE_URL` 和 `TARO_APP_SUPABASE_ANON_KEY` 已注入编译配置；目录页当前不会再回退到 API 联调地址

### Local Dev Helper

当微信开发者工具预览经常依赖重新推一次 Taro 时，使用：

```bash
pnpm dev:miniprogram:auto
```

说明：
- 这个命令会常驻运行，并在监听到小程序或其共享依赖目录变更后，自动重启 `pnpm --filter @coffeeatlas/miniprogram dev:weapp`
- 已忽略 `dist/`、`node_modules/` 等输出目录，避免构建产物导致重启循环
- 当前实现使用定时轮询目录快照，避免系统文件监听额度不足导致守护进程直接退出
- 微信开发者工具侧的自动刷新还依赖 `apps/miniprogram/project.config.json` 中 `setting.compileHotReLoad` 为 `true`

### When The Task Also Touches Web / API
- 如果改了 `/api/v1/*` 响应或 shared-types，额外补读 `api/backend` 规范
- 小程序任务可以读取 `apps/api` 实现做参考，但不要把服务端/Next.js 约束带进 `apps/miniprogram`

---

## Manual Verification Checklist

### Miniprogram
- 页面能在微信开发者工具打开
- 如果改了 `/api/v1/*` 相关流程，要验证 API 基地址未配置时有明确提示
- 如果改了目录页或目录数据读取，要验证 Supabase 环境缺失时有明确提示
- 如果改了首页入口或 all-beans 路径，要验证入口意图、tab 落点和筛选状态
- 如果改了登录/收藏/onboarding/API override，要验证 storage 状态是否正确更新
- 如果改了本地守护脚本或共享包依赖，至少跑一次 `pnpm --filter @coffeeatlas/miniprogram test`

### Cross-Layer
- 如果改了 `/api/v1/*` 或 shared-types，至少验证一次返回 envelope 与字段结构

---

## Forbidden Patterns

- 在客户端组件中 import `@/lib/server/*`
- 在小程序里使用 HTML 标签而不是 `@tarojs/components`
- 在多个页面各自复制一份 API 请求封装
- 在页面或 hooks 中直接 new Supabase client，绕过 `utils/supabase.ts` / `services/catalog-supabase.ts`
- 新增全局状态库（Redux/Zustand/Jotai），除非明确决定升级架构
- 让 shared-types、本地 miniprogram types、实际 API 响应三者悄悄不一致
- 让页面各自直接读写 storage key，绕过 `src/utils/storage.ts`
- 把 `/api/v1/*` 和 legacy `/api/beans` / `/api/roasters` 的响应格式混在一起

---

## Notes On Current Exceptions

- `packages/api-client` 还未成为小程序主入口，因此不要把“已经有 package”误写成“全项目都在使用”。
- 小程序 `services/api.ts` 有 placeholder / 本地地址检测，这是一个必须保留的安全网。
- 目录数据读取当前以 Supabase 为准，不要再把“小程序默认通过 API base URL 拉目录数据”写进规范。
- 部分页面仍带较重 orchestration 逻辑，这是当前现实；新增复用逻辑时优先抽到本地 helper，而不是先上全局状态。
