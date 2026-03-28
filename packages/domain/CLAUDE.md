[根目录](../../CLAUDE.md) > packages > **domain**

# packages/domain — 领域逻辑包

## 模块职责

存放平台无关的纯领域逻辑：数据映射（mapper）、业务校验（validation）、目录和烘焙商领域规则。
当前为骨架状态，大部分文件仅含 `export {}`，待 Phase 2 数据访问层重构时填充。

---

## 入口与启动

- 入口：`src/index.ts`（re-export catalog / roasters / mappers / validation）
- 构建：`pnpm build`（`tsc -b`）
- 包名：`@coffee-atlas/domain`

---

## 对外接口

当前所有子模块均为空骨架（`export {}`）：

| 文件 | 状态 | 预期职责 |
|------|------|---------|
| `src/catalog.ts` | 空骨架 | 目录领域规则（价格计算、库存判断等） |
| `src/roasters.ts` | 空骨架 | 烘焙商领域规则 |
| `src/mappers.ts` | 空骨架 | DB Row → Domain Model 映射函数 |
| `src/validation.ts` | 空骨架 | 输入校验（当前在 `apps/api/lib/server/admin-catalog.ts` 中内联） |

---

## 关键依赖与配置

- 依赖：`@coffee-atlas/shared-types workspace:*`
- devDependencies：`typescript 5.8.2`
- 禁止引入 `next/*` 或 `@tarojs/*`

---

## 测试与质量

- 无测试配置（缺口）
- 类型检查：`pnpm typecheck`

---

## 常见问题 (FAQ)

**Q: 为什么 domain 包是空的？**
A: Monorepo 迁移时先建立包结构，实际逻辑仍在 `apps/api/lib/catalog.ts` 和 `apps/api/lib/server/admin-catalog.ts` 中。
Phase 2 重构时将逐步将 mapper 和 validation 逻辑迁移至此包。

---

## 相关文件清单

- `/Users/gabi/CoffeeAtlas-Web/packages/domain/src/index.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/domain/src/catalog.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/domain/src/roasters.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/domain/src/mappers.ts`
- `/Users/gabi/CoffeeAtlas-Web/packages/domain/src/validation.ts`

## 变更记录 (Changelog)

| 日期 | 说明 |
|------|------|
| 2026-03-14 | 初次生成，记录骨架状态 |
