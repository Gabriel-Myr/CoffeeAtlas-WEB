# Directory Structure

> 当前仓库是 monorepo。前端代码主要分布在 `apps/miniprogram`、`apps/api` 和 `packages/shared-types`。

---

## API Reference (`apps/api`)

```
apps/api/
├── app/api/
│   ├── health/route.ts
│   ├── beans/route.ts
│   ├── roasters/route.ts
│   └── v1/**
├── lib/
│   ├── catalog.ts
│   ├── supabase.ts
│   ├── sales.ts
│   ├── sample-data.ts
│   ├── geo-data*.ts
│   ├── types.ts
│   └── server/
│       ├── api-helpers.ts
│       ├── api-primitives.ts
│       ├── public-api.ts
│       ├── favorites-api.ts
│       ├── auth-*.ts
│       ├── wechat-auth.ts
│       └── admin-*.ts
├── scripts/
├── tests/
└── db/
    ├── sql/
    └── migrations/
```

### Placement Rules

- API 路由放 `app/api/**`
- 公开目录数据访问放 `lib/catalog.ts`
- API 参数解析 / 鉴权 / envelope helper 放 `lib/server/`
- CLI / smoke / env 检查脚本放 `scripts/`
- 单元测试放 `tests/**/*.test.ts`

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
