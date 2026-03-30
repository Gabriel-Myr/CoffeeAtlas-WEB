# Trellis 多 Agent（Codex）使用说明

这份说明只针对当前仓库，目标是让你能直接从 Codex 启动 Trellis 的多 agent 流程。

## 这套流程做了什么

这个仓库里的 Trellis 多 agent 不是很多 agent 同时改同一个目录，而是下面这条链路：

1. 在主仓库创建一个任务目录
2. 为这个任务创建独立 `git worktree`
3. 在 worktree 里启动一个调度 agent
4. 调度 agent 按阶段执行 `implement`、`check`、`finish`、`create-pr`

现在已经补上了 Codex 适配层：

- `pnpm trellis:parallel:plan`
- `pnpm trellis:parallel:start`
- `pnpm trellis:parallel:status`
- `pnpm trellis:parallel:cleanup`

另外，`--platform codex` 运行时会读取：

- `.codex/agents/plan.toml`
- `.codex/agents/dispatch.toml`

把里面的角色说明注入到 `codex exec` 的 prompt 里。原因很简单：当前 Codex CLI 顶层没有像 Claude 那样的 `--agent` 参数，所以这里做的是“项目内 prompt 注入适配”。

## 什么时候适合用

适合：

- 一个任务需要完整的实现 → 检查 → 收尾流程
- 你希望把代码改动隔离在单独 worktree
- 你想保留任务目录、PRD、日志和状态记录

不太适合：

- 很小的一次性改动
- 只是问问题，不需要真的开工
- 需求还很模糊，连 `done` 长什么样都没想清楚

## 最常用的启动方式

### 1. 先规划任务

```bash
pnpm trellis:parallel:plan -- \
  --name codex-multi-agent \
  --type fullstack \
  --requirement "补齐当前仓库的 Codex 多 agent 工作流，提供入口命令和中文文档"
```

参数说明：

- `--name`: 任务短名，会参与 branch / task 目录命名
- `--type`: `backend` / `frontend` / `fullstack`
- `--requirement`: 需求说明，尽量写清楚

执行后会在 `.trellis/tasks/` 下创建任务目录，并生成 `.plan-log`。

### 2. 启动 worktree 里的调度 agent

```bash
pnpm trellis:parallel:start -- .trellis/tasks/03-31-codex-multi-agent
```

它会做这些事：

- 创建或复用 worktree
- 复制 `.trellis/.developer`
- 在 worktree 写入 `.trellis/.current-task`
- 启动 Codex 非交互会话
- 注册 agent 到本地 registry

## 怎么看状态

### 看总览

```bash
pnpm trellis:parallel:status
```

### 看某个任务的日志

```bash
pnpm trellis:parallel:status -- --log codex-multi-agent
```

### 实时看日志

```bash
pnpm trellis:parallel:status -- --watch codex-multi-agent
```

### 看详细状态

```bash
pnpm trellis:parallel:status -- --detail codex-multi-agent
```

## 怎么清理 worktree

任务确认结束后再清理：

```bash
pnpm trellis:parallel:cleanup -- feature/codex-multi-agent
```

如果你不确定 branch 名，可以先看：

```bash
pnpm trellis:parallel:status -- --list
```

## 当前实现的边界

### 1. Codex 顶层 agent 是“注入式”适配

这里不是通过 `codex exec --agent ...` 启动，因为当前 CLI 没有这个顶层参数。  
当前做法是把 `.codex/agents/*.toml` 里的 `developer_instructions` 注入到 prompt。

### 2. `plan` / `dispatch` 是项目内角色，不是系统内建角色

所以如果你后面改这两个 `.toml`，等于是在改这个仓库自己的多 agent 行为。

### 3. `worktree.yaml` 现在没有自动装依赖

当前 `.trellis/worktree.yaml` 里 `post_create` 还是空的。  
如果你想让每个 worktree 自动跑 `pnpm install`，可以后续再补，但会让启动变慢。

## 我推荐的使用习惯

1. 需求不清楚时，先别直接 `start`
2. 先用 `plan` 让任务目录和 `prd.md` 成型
3. 再用 `start` 进 worktree 流程
4. 跑的过程中主要看 `status`
5. 结束后再 `cleanup`

## 这次改动涉及的关键文件

- `.trellis/scripts/common/cli_adapter.py`
- `.trellis/scripts/multi_agent/plan.py`
- `.trellis/scripts/multi_agent/start.py`
- `.codex/agents/plan.toml`
- `.codex/agents/dispatch.toml`
- `package.json`
