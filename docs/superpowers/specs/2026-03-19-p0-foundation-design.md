# P0 Foundation Repair Design

**Goal:** 先把仓库最影响协作效率的工程底座修回可维护状态：统一项目身份、统一 pnpm 使用方式、清理构建垃圾、修通 lint。

**Scope:**
- 统一 `README`、健康检查、Web 包名中的项目命名
- 统一包管理文档为 pnpm，并移除错误锁文件
- 扩充根 `.gitignore`，拦住当前已出现的构建产物和临时文件
- 修复 `pnpm -w lint`，让 Web lint 能在 Next 16 下正常执行

**Non-goals:**
- 这一轮不处理 `packages/domain` / `packages/api-client` 空壳包
- 不做 shared types 去重
- 不拆 `public-api.ts` 和 `catalog.ts`
- 不做首页 / 全部豆页面的 UI 抽象

**Design:**
1. 项目身份统一为 `CoffeeAtlas`
   - README 标题、介绍、启动方式改成 monorepo 现实
   - Web 包名从 `coffeestories-webdb` 改为 `@coffeeatlas/api`
   - 健康检查返回统一的 `service` 名称，避免日志和监控混乱
2. 包管理统一为 pnpm
   - README 只保留 `pnpm install` / `pnpm dev` / `pnpm lint` / `pnpm typecheck`
   - 删除 `apps/api/package-lock.json`，避免出现双锁文件
3. 仓库忽略规则补齐
   - 新增 `.turbo`、`.next`、`dist`、`coverage`、`*.tsbuildinfo`、日志和临时目录
   - 目标是让根工作区恢复“默认干净”，不再把构建垃圾混进 git status
4. Lint 修复采用“最小可信方案”
   - 不继续使用已不适配当前版本组合的 `next lint`
   - 在仓库根新增 ESLint flat config，Web 和 packages/miniprogram 共用一套入口
   - Web 继续使用 `eslint-config-next/core-web-vitals`；非 Next 目录使用基础 TS/JS lint 规则

**Risks / Assumptions:**
- 现有 `.trellis` 文档里仍有旧包名，暂不在这轮全量同步，只修用户入口和运行期标识
- 共享包 lint 目前还是历史债，这轮至少先把 lint 入口变成真实检查，不再 `echo`
- 工作区已有未提交构建产物，本轮只修规则和相关文件，不回滚用户已有改动

**Verification:**
- `pnpm -w lint`
- `pnpm -w typecheck`
- `git status --short` 中不再持续新增本轮已覆盖的构建垃圾
