# Directory Structure

> 当前文档聚焦 `apps/miniprogram`。如果任务只改小程序，优先按这里的目录规则；只有在联动 API / shared-types 时，再去看其他 package。

---

## Related Read-Only Context

当小程序任务需要联动接口契约或查现有实现时，常会顺手读到：

- `apps/api/app/api/v1/**`
- `apps/api/lib/server/**`
- `packages/shared-types/src/**`

这些目录是理解上下游所需，但不是当前小程序代码的主要落点。

---

## Miniprogram (`apps/miniprogram/src`)

```
apps/miniprogram/src/
├── app.tsx / app.config.ts / app.scss
├── pages/
│   ├── onboarding/
│   ├── index/
│   ├── all-beans/
│   ├── bean-detail/
│   ├── roaster-detail/
│   ├── profile/
│   └── ...page-local helpers (`copy.ts`, `route-params.ts`, `entry-intent.ts`)
├── components/
│   ├── AtlasPageHero/
│   ├── BeanCard/
│   ├── EmptyState/
│   ├── FilterBar/
│   ├── Icon/
│   ├── NewArrivalFilterBar/
│   ├── RoasterCard/
│   └── SearchBar/
├── services/
│   ├── api.ts
│   ├── catalog-read-mode.ts
│   └── catalog-supabase.ts
├── types/
│   ├── index.ts
│   ├── global.d.ts
│   └── shared-types-contract.typecheck.ts
└── utils/
    ├── api-base-url.ts
    ├── api-config.ts
    ├── api-error.ts
    ├── api-request.ts
    ├── auth.ts
    ├── compiled-env.ts
    ├── external-links.ts
    ├── storage.ts
    ├── formatters.ts
    ├── origin-atlas.ts
    ├── origin-atlas-shapes.generated.ts
    ├── restart-onboarding.ts
    └── supabase.ts
```

### Placement Rules

- 页面一律放 `pages/<name>/index.tsx`
- 页面私有逻辑优先和页面放在同目录，例如 `pages/all-beans/route-params.ts`
- Taro 组件一律一个目录一个组件：`index.tsx` + `index.scss`
- 用户态 `/api/v1/*` 请求集中在 `services/api.ts`
- 目录读操作集中在 `services/catalog-supabase.ts`，是否允许读取由 `services/catalog-read-mode.ts` 控制
- runtime API 地址覆盖逻辑只放 `utils/api-config.ts`
- Supabase 环境变量和 fetch 适配只放 `utils/supabase.ts`
- token / 收藏 / 历史记录 / onboarding 都走 `utils/storage.ts`

---

## Shared Packages (`packages/*`)

```
packages/
├── shared-types/   # 当前权威 DTO / response / query param 契约
├── api-client/     # 通用 envelope unwrap / error helper 等 client 辅助
└── domain/         # 平台无关 snapshot、mapper、领域 helper
```

### Rules

- `packages/*` 禁止引入 `next/*`、`next/server`、`@tarojs/*`
- 当前如果只是改 API 契约，先改 `shared-types`
- 如果是收藏快照、页面复用 mapper、平台无关领域转换，优先检查 `domain`
- 不要因为有 `api-client` / `domain` 目录就把新逻辑强行挪过去；只有真正跨端、已抽象稳定的内容才迁移
