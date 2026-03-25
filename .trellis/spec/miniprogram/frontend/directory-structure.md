# Directory Structure

> 当前文档聚焦 `apps/miniprogram`。如果任务只改小程序，优先按这里的目录规则；只有在联动 API / shared-types 时，再去看其他 package。

---

## Related Read-Only Context

当小程序任务需要联动接口契约或查现有实现时，常会顺手读到：

- `apps/web/app/api/v1/**`
- `apps/web/lib/server/**`
- `packages/shared-types/src/**`

这些目录是理解上下游所需，但不是当前小程序代码的主要落点。

---

## Miniprogram (`apps/miniprogram/src`)

```
apps/miniprogram/src/
├── app.tsx / app.config.ts / app.scss
├── pages/
│   ├── index/
│   ├── all-beans/
│   ├── bean-detail/
│   ├── roasters/
│   ├── roaster-detail/
│   ├── profile/
│   └── debug/
├── components/
│   ├── BeanCard/
│   ├── RoasterCard/
│   ├── SearchBar/
│   ├── FilterBar/
│   ├── EmptyState/
│   └── Icon/
├── services/
│   └── api.ts
├── types/
│   ├── index.ts
│   └── global.d.ts
└── utils/
    ├── api-config.ts
    ├── auth.ts
    ├── storage.ts
    ├── formatters.ts
    ├── origin-atlas.ts
    └── external-links.ts
```

### Placement Rules

- 页面一律放 `pages/<name>/index.tsx`
- Taro 组件一律一个目录一个组件：`index.tsx` + `index.scss`
- API 调用集中在 `services/api.ts`
- runtime API 地址覆盖逻辑只放 `utils/api-config.ts`
- token / 收藏 / 历史记录都走 `utils/storage.ts`

---

## Shared Packages (`packages/*`)

```
packages/
├── shared-types/   # 当前权威 DTO / response / query param 契约
├── api-client/     # 预备中的跨端 client，当前只部分实现
└── domain/         # 预备中的纯领域逻辑，当前只部分实现
```

### Rules

- `packages/*` 禁止引入 `next/*`、`next/server`、`@tarojs/*`
- 当前如果只是改 API 契约，先改 `shared-types`
- 不要因为有 `api-client` / `domain` 目录就把新逻辑强行挪过去；只有真正跨端、已抽象稳定的内容才迁移
