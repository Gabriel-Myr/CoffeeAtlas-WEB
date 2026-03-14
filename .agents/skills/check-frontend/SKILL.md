---
name: check-frontend
description: Review changed frontend code against this project's Trellis frontend guidelines and fix any violations.
---

This is the Codex entry for the Trellis `check-frontend` workflow in this repository.
Follow the instructions below as the project-specific operating procedure.

Check if the code you just wrote follows the frontend development guidelines.

Execute these steps:
1. Run `git status` to see modified files
2. Read `.trellis/spec/frontend/index.md` to understand which guidelines apply
3. Based on what you changed, read the relevant guideline files:
   - Component changes → `.trellis/spec/frontend/component-guidelines.md`
   - Hook changes → `.trellis/spec/frontend/hook-guidelines.md`
   - State changes → `.trellis/spec/frontend/state-management.md`
   - Type changes → `.trellis/spec/frontend/type-safety.md`
   - Any changes → `.trellis/spec/frontend/quality-guidelines.md`
4. Review your code against the guidelines
5. Report any violations and fix them if found
