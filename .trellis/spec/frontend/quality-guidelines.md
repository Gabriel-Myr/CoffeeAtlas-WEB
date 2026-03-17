# Quality Guidelines

---

## Required Commands

按改动范围执行：

```bash
pnpm lint
pnpm typecheck
```

如果改了 Web server/helper 或可测试的纯函数，再跑：

```bash
pnpm --filter coffeestories-webdb test
```

如果改了小程序，再跑：

```bash
pnpm --filter @coffeeatlas/miniprogram typecheck
```

API 改动且有可访问环境时，再补：

```bash
cd apps/web && API_BASE_URL=http://127.0.0.1:3000 pnpm smoke:api
```

---

## Frontend Reality Rules

### Web
- 优先服务端页面取数，再把 `initial*` 数据传给客户端组件
- 交互状态留在客户端组件，不把 server-only helper 引进 `use client` 文件
- Atlas 风格页面依赖 CSS 变量、衬线标题、地图卡片层次，不要无关任务里改成泛化模板风格

### Miniprogram
- 所有 API 调用集中在 `src/services/api.ts`
- API 地址覆盖与联调提醒集中在 `src/utils/api-config.ts`
- 收藏、token、历史记录集中在 `src/utils/storage.ts`
- 页面加载与分页要防止并发请求覆盖（参考 `all-beans/index.tsx` 的 request version 模式）

---

## Manual Verification Checklist

### Web
- 首页 `/` 可以正常渲染、搜索、切 tab、切主题
- `/all-beans` 搜索与列表正常
- 如果改了 `/api/v1/*`，至少验证一次返回 envelope 与字段结构

### Miniprogram
- 页面能在微信开发者工具打开
- API 基地址未配置时有明确提示
- 如果改了登录/收藏/API override，要验证 storage 状态是否正确更新

---

## Forbidden Patterns

- 在客户端组件中 import `@/lib/server/*`
- 在小程序里使用 HTML 标签而不是 `@tarojs/components`
- 在多个页面各自复制一份 API 请求封装
- 新增全局状态库（Redux/Zustand/Jotai），除非明确决定升级架构
- 让 shared-types、本地 miniprogram types、实际 API 响应三者悄悄不一致
- 把 `/api/v1/*` 和 legacy `/api/beans` / `/api/roasters` 的响应格式混在一起

---

## Notes On Current Exceptions

- `HomePageClient.tsx` 和 `AllBeansClient.tsx` 仍有内联 `BeanCard`，属于当前现实，不是默认推荐的新模式。
- `packages/api-client` 还未成为小程序主入口，因此不要把“已经有 package”误写成“全项目都在使用”。
- 小程序 `services/api.ts` 有 placeholder / 本地地址检测，这是一个必须保留的安全网。
