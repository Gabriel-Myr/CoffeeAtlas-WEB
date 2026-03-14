[根目录](../../CLAUDE.md) > packages > **api-client**

# packages/api-client — 跨平台 API 客户端

## 模块职责

封装对 CoffeeAtlas API 网关（`/api/v1/*`）的 fetch 调用，供 Web 端 CSR 组件和未来的 Taro 小程序共用。
使用 `@coffee-atlas/shared-types` 的类型定义，保证请求/响应类型安全。

---

## 入口与启动

- 入口：`src/index.ts`（导出 `ApiClient` 类及各模块函数）
- 构建：`pnpm build`（`tsc -b`）
- 包名：`@coffee-atlas/api-client`

---

## 对外接口

### `ApiClient` 类（`src/index.ts`）

```typescript
class ApiClient {
  constructor(baseUrl: string)
  getBeans(params?: BeansQueryParams): Promise<PaginatedResult<CatalogBeanCard>>
  getBeanDetail(id: string): Promise<CatalogBeanDetail>
  getRoasters(params?: RoastersQueryParams): Promise<PaginatedResult<RoasterSummary>>
  getRoasterDetail(id: string): Promise<RoasterDetail>
}
```

### 独立函数模块

- `src/beans.ts`：咖啡豆相关请求函数
- `src/roasters.ts`：烘焙商相关请求函数
- `src/errors.ts`：API 错误类型定义

---

## 关键依赖与配置

- 依赖：`@coffee-atlas/shared-types workspace:*`
- devDependencies：`typescript 5.8.2`
- 使用原生 `fetch`，无第三方 HTTP 库
- 禁止引入 `next/*` 或 `@tarojs/*`

---

## 测试与质量

- 无测试配置（缺口）
- 类型检查：`pnpm typecheck`

---

## 常见问题 (FAQ)

**Q: 小程序端如何使用此包？**
A: Taro 支持原生 `fetch`，直接实例化 `new ApiClient(process.env.TARO_APP_API_URL)` 即可。
API 基础 URL 通过环境变量 `TARO_APP_API_URL` 注入（见 `turbo.json` 的 `env` 配置）。

---

## 相关文件清单

- `/Users/gabi/CoffeeAtlas-Web/packages/api-client/src/index.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/api-client/src/beans.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/api-client/src/roasters.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/api-client/src/errors.ts`

## 变更记录 (Changelog)

| 日期 | 说明 |
|------|------|
| 2026-03-14 | 初次生成 |
