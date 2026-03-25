# Quality Guidelines

---

## Required Commands

按改动范围执行，默认先看小程序：

```bash
pnpm lint
pnpm typecheck
pnpm --filter @coffeeatlas/miniprogram typecheck
```

如果改了 Web server/helper、共享契约或可测试的纯函数，再补：

```bash
pnpm --filter @coffeeatlas/web test
```

API 改动且有可访问环境时，再补：

```bash
cd apps/web && API_BASE_URL=http://127.0.0.1:3000 pnpm smoke:api
```

---

## Frontend Reality Rules

### Miniprogram
- 所有 API 调用集中在 `src/services/api.ts`
- API 地址覆盖与联调提醒集中在 `src/utils/api-config.ts`
- 收藏、token、历史记录集中在 `src/utils/storage.ts`
- tab 间入口语义优先复用 `entry-intent`
- 页面加载与分页要防止并发请求覆盖（参考 `all-beans/index.tsx` 的 request version 模式）

### When The Task Also Touches Web / API
- 如果改了 `/api/v1/*` 响应或 shared-types，额外补读 `web/backend` 规范
- 小程序任务可以读取 web 端实现做参考，但不要把 web 组件/Next.js 约束带进 `apps/miniprogram`

---

## Manual Verification Checklist

### Miniprogram
- 页面能在微信开发者工具打开
- API 基地址未配置时有明确提示
- 如果改了首页入口或 all-beans 路径，要验证入口意图、tab 落点和筛选状态
- 如果改了登录/收藏/onboarding/API override，要验证 storage 状态是否正确更新

### Cross-Layer
- 如果改了 `/api/v1/*` 或 shared-types，至少验证一次返回 envelope 与字段结构

---

## Forbidden Patterns

- 在客户端组件中 import `@/lib/server/*`
- 在小程序里使用 HTML 标签而不是 `@tarojs/components`
- 在多个页面各自复制一份 API 请求封装
- 新增全局状态库（Redux/Zustand/Jotai），除非明确决定升级架构
- 让 shared-types、本地 miniprogram types、实际 API 响应三者悄悄不一致
- 让页面各自直接读写 storage key，绕过 `src/utils/storage.ts`
- 把 `/api/v1/*` 和 legacy `/api/beans` / `/api/roasters` 的响应格式混在一起

---

## Notes On Current Exceptions

- `packages/api-client` 还未成为小程序主入口，因此不要把“已经有 package”误写成“全项目都在使用”。
- 小程序 `services/api.ts` 有 placeholder / 本地地址检测，这是一个必须保留的安全网。
- 部分页面仍带较重 orchestration 逻辑，这是当前现实；新增复用逻辑时优先抽到本地 helper，而不是先上全局状态。
