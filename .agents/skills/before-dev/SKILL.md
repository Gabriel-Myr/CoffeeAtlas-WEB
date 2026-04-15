---
name: before-dev
description: "Read the minimum relevant Trellis specs before implementation. Use when starting a coding task, switching package/layer, or refreshing project conventions."
---

开始写代码前，先读和当前任务真正相关的规范，不要大范围预读。

说明：

- `before-dev` 只负责读本仓库 Trellis spec
- 如果读完 spec 之后还需要一个短规划，默认复用你全局的 `think`
- 不要把 `before-dev` 变成通用思考 skill 的替代品

执行顺序：

1. **Discover packages and their spec layers**:
   ```bash
   python3 ./.trellis/scripts/get_context.py --mode packages
   ```

2. **Identify which specs apply** based on:
   - 你改的是哪个 package
   - 你做的是哪一层的工作
   - 这次是否跨层

   In this repo, `get_context.py --mode packages` marks the current default package.
   If it shows `miniprogram (default)` and your task is only in `apps/miniprogram`, start from:

   ```bash
   cat .trellis/spec/miniprogram/frontend/index.md
   ```

3. **Read only the needed index files**:
   ```bash
   cat .trellis/spec/<package>/<layer>/index.md
   ```
   只读和当前任务匹配的 index，不要一上来全读。

4. **Read the specific guideline files** pointed to by those indexes.
   `index.md` 只是导航，真正有约束的是里面列出的具体文件。

5. **Read shared guides only when they matter**:
   ```bash
   cat .trellis/spec/guides/index.md
   ```
   如果任务跨层、容易重复造轮子、或者边界复杂，再去看对应 guide。

6. 读完之后直接进入实现，或者先用全局 `think` 做一个短规划。

原则：

- 先读，再改
- 只读必要规范
- 不把 `before-dev` 变成大流程
- 改动跨层时，再补读 `guides/`
