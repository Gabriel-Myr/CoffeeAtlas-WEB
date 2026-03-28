---
name: check-cross-layer
description: Run the Trellis cross-layer verification checklist to catch multi-layer, reuse, consistency, and dependency issues.
---

This is the Codex entry for the Trellis `check-cross-layer` workflow in this repository.
Follow the instructions below as the project-specific operating procedure.

# Cross-Layer Check

Check if your changes considered all dimensions. Most bugs come from "didn't think of it", not lack of technical skill.

> **Note**: This is a **post-implementation** safety net. Ideally, read the [Pre-Implementation Checklist](.trellis/spec/guides/pre-implementation-checklist.md) **before** writing code.

---

## Related Documents

| Document | Purpose | Timing |
|----------|---------|--------|
| [Pre-Implementation Checklist](.trellis/spec/guides/pre-implementation-checklist.md) | Questions before coding | **Before** writing code |
| [Code Reuse Thinking Guide](.trellis/spec/guides/code-reuse-thinking-guide.md) | Pattern recognition | During implementation |
| **`/trellis:check-cross-layer`** (this) | Verification check | **After** implementation |

---

## Execution Steps

### 1. Identify Change Scope

```bash
git status
git diff --name-only
```

### 2. Select Applicable Check Dimensions

Based on your change type, execute relevant checks below:

---

## Dimension A: Cross-Layer Data Flow (Required when 3+ layers)

**Trigger**: Changes involve 3 or more layers

| Layer | Common Locations |
|-------|------------------|
| API/Routes | `apps/api/app/api/v1/**` |
| Service/Business Logic | `apps/miniprogram/src/services/**`, `apps/api/lib/server/**`, `packages/domain/**` |
| Contracts | `packages/shared-types/**`, `apps/miniprogram/src/types/**` |
| UI/Presentation | `apps/miniprogram/src/pages/**`, `apps/miniprogram/src/components/**` |
| Storage/Runtime Config | `apps/miniprogram/src/utils/storage.ts`, `apps/miniprogram/src/utils/api-config.ts` |

**Checklist**:
- [ ] Read flow checked end to end?
  Typical miniprogram path: `apps/api/app/api/v1/*` -> `packages/shared-types` / mapper -> `src/services/api.ts` -> `pages/*`
- [ ] Write flow checked end to end?
  Typical miniprogram path: page interaction -> `src/services/api.ts` -> `/api/v1/*` -> server helper / persistence
- [ ] Types/schemas correctly passed between layers?
- [ ] Errors properly propagated to caller?
- [ ] Loading/pending states handled at each layer?

**Detailed Guide**: `.trellis/spec/guides/cross-layer-thinking-guide.md`

---

## Dimension B: Code Reuse (Required when modifying constants/config)

**Trigger**: 
- Modifying UI constants (label, icon, color)
- Modifying any hardcoded value
- Seeing similar code in multiple places
- Creating a new utility/helper function
- Just finished batch modifications across files

**Checklist**:
- [ ] Search first: How many places define this value?
  ```bash
  rg -n "value-to-change" apps/miniprogram/src apps/api packages
  ```
- [ ] If 2+ places define same value -> Should extract to shared constant
- [ ] After modification, all usage sites updated?
- [ ] If creating utility: Does similar utility already exist?

**Detailed Guide**: `.trellis/spec/guides/code-reuse-thinking-guide.md`

---

## Dimension B2: New Utility Functions

**Trigger**: About to create a new utility/helper function

**Checklist**:
- [ ] Search for existing similar utilities first
  ```bash
  rg -n "functionNamePattern" apps/miniprogram/src apps/api packages
  ```
- [ ] If similar exists, can you extend it instead?
- [ ] If creating new, is it in the right location (shared vs domain-specific)?

---

## Dimension B3: After Batch Modifications

**Trigger**: Just modified similar patterns in multiple files

**Checklist**:
- [ ] Did you check ALL files with similar patterns?
  ```bash
  rg -n "patternYouChanged" apps/miniprogram/src apps/api packages
  ```
- [ ] Any files missed that should also be updated?
- [ ] Should this pattern be abstracted to prevent future duplication?

---

## Dimension C: Import/Dependency Paths (Required when creating new files)

**Trigger**: Creating new source files

**Checklist**:
- [ ] Using correct import paths (relative vs absolute)?
- [ ] No circular dependencies?
- [ ] Consistent with monorepo boundaries?
- [ ] `packages/*` stayed platform-neutral?

---

## Dimension D: Same-Layer Consistency

**Trigger**: 
- Modifying display logic or formatting
- Same domain concept used in multiple places

**Checklist**:
- [ ] Search for other places using same concept
  ```bash
  rg -n "ConceptName" apps/miniprogram/src apps/api packages
  ```
- [ ] Are these usages consistent?
- [ ] Should they share configuration/constants?

---

## Common Issues Quick Reference

| Issue | Root Cause | Prevention |
|-------|------------|------------|
| Changed one place, missed others | Didn't search impact scope | `grep` before changing |
| Data lost at some layer | Didn't check data flow | Trace data source to destination |
| Type/schema mismatch | Cross-layer types inconsistent | Use shared type definitions |
| UI/output inconsistent | Same concept in multiple places | Extract shared constants |
| Similar utility exists | Didn't search first | Search before creating |
| Batch fix incomplete | Didn't verify all occurrences | rg after fixing |
| Miniprogram type drift | shared-types / local types / API response diverged | Check all three together |
| Entry state mismatch | tab intent / route params / page state not aligned | Verify re-entry path |

---

## Output

Report:
1. Which dimensions your changes involve
2. Check results for each dimension
3. Issues found and fix suggestions
