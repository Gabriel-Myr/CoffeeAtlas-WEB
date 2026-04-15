---
name: check-cross-layer
description: Run an extra Trellis verification pass for cross-layer, reuse, consistency, or dependency-sensitive changes. Use only when the change really spans those dimensions.
---

这是补充检查，不是每个任务都要跑。
只有在变更真的跨层、涉及复用/配置、或者容易出现遗漏时再用。

# Cross-Layer Check

## 1. 先确认是否需要

满足任一条件再继续：

- 改动跨 3 层及以上
- 改了共享类型、API 契约、数据映射
- 改了常量、配置、入口状态、存储键
- 新建了公共工具或批量改了相似代码

先看范围：

```bash
git status
git diff --name-only
```

## 2. 只检查相关维度

### A. 数据流

适用：API、shared-types、service、page/component 同时受影响。

检查：

- 读路径是否从源头到终点都通了
- 写路径是否从交互到持久层都通了
- 类型和字段名是否一致
- 错误和空态是否在边界上传递正确

参考：

```bash
cat .trellis/spec/guides/cross-layer-thinking-guide.md
```

### B. 复用与遗漏

适用：常量、显示逻辑、配置值、批量修改、工具函数。

先搜索：

```bash
rg -n "pattern-or-value" apps/miniprogram/src apps/api packages
```

检查：

- 是否还有同类位置没更新
- 是否已经出现重复实现
- 是否应该提取成共享常量或复用现有工具

参考：

```bash
cat .trellis/spec/guides/code-reuse-thinking-guide.md
```

### C. 依赖与边界

适用：新文件、新模块、路径调整。

检查：

- import 路径是否合理
- 是否引入循环依赖
- `packages/*` 是否仍保持平台中立

## 3. 输出要求

报告三件事：

1. 这次为什么需要跨层检查
2. 实际检查了哪些维度
3. 发现了什么问题，或者明确说明“本轮未发现跨层问题”
