# Logging Guidelines

---

## Current Repo Reality

这个仓库目前没有统一 logger 包，也没有结构化日志落地规范。

当前默认约定是：

- API / helper 代码尽量不写常驻 `console.log`
- 出错时优先抛 `HttpError` 或直接抛上游错误，让 `apiError()` 负责响应
- 诊断脚本、导入脚本、env 检查脚本可以用 `console.log` / `console.error`

---

## Server Route Rule

在 `app/api/**` 和 `lib/server/**` 中：

- 不要把临时调试日志留在提交里
- 不要打印 token、cookie、Supabase key、微信 secret、完整用户 payload
- 如果确实需要诊断信息，优先记录 request-scoped 的最小必要字段，例如 `requestId`、目标 id、分页参数

### Good

```ts
console.error('[favorites.sync]', { requestId, count: items.length });
```

### Bad

```ts
console.log('Authorization', req.headers.get('authorization'));
console.log('body', body);
```

---

## Script Rule

`apps/api/scripts/**` 和导入脚本允许更直接的控制台输出，因为它们本来就是 CLI 工具。

现有模式：

- 缺少 env -> `console.error(...)` + `process.exit(1)`
- smoke 输出 -> 打印状态码、耗时、截断后的响应文本

参考：

- `apps/api/scripts/smoke-v1.mjs`
- `apps/api/scripts/check-cloud-env.mjs`

---

## If You Need More Logging

如果后续确实需要统一 logger，不要在单个文件里偷偷引入一套新风格；先补：

1. 输出格式
2. requestId 透传方式
3. 脱敏规则
4. 本文档和 `quality-guidelines.md`
