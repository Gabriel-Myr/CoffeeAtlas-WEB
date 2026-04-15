---
name: finish-work
description: Final Trellis completion pass before handoff or commit. Confirm checks are done, spec/doc sync is handled, and the change is easy for a human to review.
---

把 `finish-work` 当成最终收尾，而不是重复一遍 `check`。

说明：

- `finish-work` 只负责 Trellis 最终交接
- 它不替代全局通用 `check`
- 这里至少要确认本仓库项目 `check` 已经完成；如果这次也用了全局 `check`，最后要一起交代结果

# Finish Work

使用时机：

- 代码已经基本完成
- 主要验证已经跑过
- 准备交给人测试、审查或提交

## 1. 先确认 `check` 已完成

你应该已经知道这些信息，而不是到这里才第一次去跑：

- 哪些文件改了
- 跑了哪些命令
- 哪些结果通过，哪些没跑
- 有没有跨层风险

如果这些还不清楚，先回到项目 `check`；如果这次还用了全局 `check`，也要把对应结果补齐。

## 2. 做最后一轮完成度确认

### 代码和测试

- 改动匹配的 lint / typecheck / test 已跑
- 是否需要新增或更新测试，已经有结论
- 没有明显的调试残留、无意义 `any`、不必要的非空断言

### Spec 和文档

- 如果改了真实契约、约束、易错点，`.trellis/spec/` 已同步
- 如果只是实现细节变化，没有新知识，也要明确说明不更新 spec 的原因

### 跨层与人工验证

- 如果任务跨层，`check-cross-layer` 已跑或已明确说明不需要
- 需要手工验证的路径已经说明清楚

### 工作树可交接

- `git status` 可读
- 主要改动点能一句话说清
- 人类接手后知道怎么验

## 3. 最终输出

至少总结这四项：

1. 完成了什么
2. 跑了哪些验证
3. 是否更新了 `.trellis/spec/`
4. 还剩什么风险或人工验证项

如果本轮同时用了全局 `check` 和项目 `check`，最终总结里要区分写清：

- 哪些结论来自全局通用审查
- 哪些结论来自 CoffeeAtlas 项目补充验证

核心原则：

> 完成工作 = 代码可读 + 验证明确 + Trellis 知识同步到位。
