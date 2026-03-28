# Test Conventions

---

## Current Runner

API 端当前使用 Node.js 内置测试运行器：

```bash
pnpm --filter @coffeeatlas/api test
```

底层命令来自 `apps/api/package.json`：

```bash
node --test --experimental-strip-types tests/**/*.test.ts
```

这意味着：

- 测试文件写在 `apps/api/tests/**/*.test.ts`
- 可以直接 import `.ts` 源文件
- 断言库用 `node:assert/strict`
- 测试框架用 `node:test`

---

## Existing Pattern

参考：`apps/api/tests/api-helpers.test.ts`

```ts
import test from 'node:test';
import assert from 'node:assert/strict';

import { parsePaginationParams } from '../lib/server/api-primitives.ts';

test('parsePaginationParams supports pageSize and legacy limit', () => {
  const result = parsePaginationParams(new URLSearchParams('page=2&pageSize=15'));
  assert.equal(result.page, 2);
});
```

注意这里 import 源文件时带 `.ts` 后缀。

---

## When You Must Add Tests

### 必补测试
- 新增或修改纯函数
- 修复参数校验 / 解析 bug
- 修复回归 bug（尤其是 `invalid_*`、分页、search sanitize、auth 判断）
- 调整 shared contract 映射逻辑且能在纯函数层验证

### 可只做手测 / smoke
- Next.js 路由壳层改动，但核心 helper 未变化
- 依赖真实 Supabase / 微信环境的流程
- 小程序页面交互

这类场景至少补：

- `pnpm typecheck`
- 必要手测
- 如果接口可访问，跑 `smoke:api`

---

## Preferred Test Targets

优先覆盖低耦合模块：

- `apps/api/lib/server/api-primitives.ts`
- `apps/api/lib/sales.ts`
- 未来 `packages/domain/**` 中的纯函数
- 独立的 mapper / sanitizer / parser

避免把第一批测试都写成依赖 Next runtime 或真实 DB 的重型集成测试。

---

## Assertion Style

- `assert.equal` / `assert.deepEqual` 用于正常返回值
- `assert.throws` 用于 `HttpError` 场景
- 断言错误时，至少校验 `status` 或 `code`，不要只断言“抛错了”

### Good

```ts
assert.throws(() => normalizeCountryCode('china'), (error: unknown) => {
  assert.ok(error instanceof HttpError);
  assert.equal(error.code, 'invalid_country_code');
  return true;
});
```

### Bad

```ts
assert.throws(() => normalizeCountryCode('china'));
```
