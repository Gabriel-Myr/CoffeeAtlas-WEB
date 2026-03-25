# Error Handling

---

## Primary Pattern: `HttpError` + API Helpers

v1 路由统一使用：

- `apps/web/lib/server/api-primitives.ts` -> `HttpError`, `badRequest`, `notFound`, `conflict`
- `apps/web/lib/server/api-helpers.ts` -> `apiSuccess`, `apiError`

### Good

```ts
export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const { page, pageSize } = parsePaginationParams(request.nextUrl.searchParams);
    const result = await listBeansV1({ page, pageSize });
    return apiSuccess(result, requestId);
  } catch (error) {
    return apiError(error, requestId);
  }
}
```

### Bad

```ts
export async function GET() {
  try {
    // ...
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}
```

不要在 v1 路由里临时发明新的错误信封。

---

## Validation Happens At The Route Edge

路由层负责把 query/body 解析成安全输入：

- query 参数 -> `parsePaginationParams`, `parsePositiveInteger`, `sanitizeSearchTerm`
- 枚举参数 -> 本地 `parseSort()` / `parseContinent()` / `parseFeature()`
- body 字段 -> `badRequest()` 提前拒绝

这样 service/helper 层拿到的就是已归一化输入。

---

## Legacy Routes Keep Legacy Shape

当前仓库存在两套公开 API 风格：

1. `app/api/v1/**` -> `apiSuccess` / `apiError`
2. `app/api/beans`、`app/api/roasters` -> 旧格式 + `toLegacyError()`

规则：

- 修改 `/api/v1/*` 时保持新信封
- 修改 legacy 路由时保持旧响应格式，除非明确执行兼容性迁移
- 不要在一个 handler 里混用两种格式

---

## Auth And External Service Errors Must Stay Specific

现有例子：

- `apps/web/lib/server/auth-user.ts` -> 未登录时抛 `HttpError(401, 'unauthorized', ...)`
- `apps/web/lib/server/wechat-auth.ts` -> 微信配置缺失、微信接口失败、登录失败分别给不同 code

推荐做法：

| Scenario | Status | Code |
|----------|--------|------|
| 缺少登录态 | 401 | `unauthorized` |
| 参数错误 | 400 | `bad_request` / `invalid_*` |
| 资源不存在 | 404 | `*_not_found` |
| 去重冲突 | 409 | `conflict` / `duplicate_*` |
| 外部服务失败 | 502 | `*_api_error` |
| 配置缺失 | 500 | `*_config_missing` |

---

## Catch Broadly Only At The Route Boundary

helper/service 层默认直接 `throw`：

```ts
const { data, error } = await db.from('user_favorites').select('*');
if (error) throw error;
```

路由层再统一兜底：

```ts
try {
  return apiSuccess(await doWork());
} catch (err) {
  return apiError(err);
}
```

例外：`getBeanDiscoverV1()` 这种明确设计成“主流程失败时回退到本地 discover payload”的函数，可以在函数内部 catch，但必须是产品行为而不是为了吞错。
