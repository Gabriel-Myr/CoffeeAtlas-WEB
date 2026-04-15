---
name: check
description: "Project-specific verification add-on for CoffeeAtlas. Read the relevant Trellis specs, run the package-specific checks, and confirm repo-specific risks after implementation."
---

这是 CoffeeAtlas 仓库自己的 `check` 补充规则。

如果你的 Codex 全局已经按 `Waza` 配好通用 `check`，默认分工是：

- 全局 `check`：负责通用 diff 审查、风险识别、验证态度
- 本仓库 `check`：负责 CoffeeAtlas 的 package 判断、命令选择、spec 同步和跨层补充

不要把这里当成一套新的通用审查哲学；这里只写本仓库特有约束。

## 1. 看清改了什么

```bash
git diff --name-only HEAD
python3 ./.trellis/scripts/get_context.py --mode packages
```

先从 `default` package 对应的 index 开始读。
如果任务只在 `apps/miniprogram`，先看 `miniprogram/frontend`，不要一上来把所有 spec 都读一遍。

## 2. 读相关 spec

```bash
cat .trellis/spec/<package>/<layer>/index.md
```

然后只打开 index 里和这次改动真正相关的规范文件，重点看：

- 质量要求
- 命名 / 类型 / 数据流约束
- 测试要求

## 3. 跑匹配的验证命令

小程序优先的基线：

```bash
pnpm lint
pnpm typecheck
pnpm --filter @coffeeatlas/miniprogram typecheck
```

只有在改动真的涉及 API 时再加：

```bash
pnpm --filter @coffeeatlas/api test
cd apps/api && API_BASE_URL=http://127.0.0.1:3000 pnpm smoke:api
```

如果改动主要在共享层，至少补判断这些影响：

- `packages/shared-types`
- `packages/api-client`
- `packages/domain`

按实际影响决定是否需要补跑对应 package 的 `typecheck` / `test`。不要只因为入口页面在小程序就忽略共享层。

## 4. 检查这些点

- 代码行为是否和真实代码路径一致
- 是否漏改了同类入口、模板、配置或调用方
- 是否需要新增或更新测试
- `.trellis/spec/` 是否应该同步
- 如果是跨层改动，是否需要补跑 `check-cross-layer`

## 5. 输出要求

- 有问题：给出具体文件、问题和修复建议；能直接修就直接修
- 没问题：明确写“本轮未发现问题”，同时说明还有没有未跑的验证项

补充要求：

- 明确说明这次是只跑了项目 `check`，还是同时结合了全局通用 `check`
- 如果没更新 `.trellis/spec/`，要说明是“这次没有新增项目级约束”，不是省略不提
