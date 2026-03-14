# Quality Guidelines

---

## 代码规范

### TypeScript

- `strict: true`，禁止 `any`
- 所有导出函数必须有明确的返回类型
- 接口用 `interface`，联合类型用 `type`

### 命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `BeanCard` |
| 函数/变量 | camelCase | `formatSalesCount` |
| 常量 | UPPER_SNAKE | `BASE_URL` |
| CSS 类 | BEM kebab-case | `bean-card__tag--sales` |
| 文件 | 与导出一致 | `BeanCard/index.tsx` |

---

## 测试策略

> 当前阶段以手动测试为主，自动化测试待后续补充。

### 手动测试检查项

- [ ] 小程序：微信开发者工具真机预览
- [ ] Web：`pnpm dev` 本地验证
- [ ] API：curl 或 Postman 验证响应格式

### 未来自动化测试方向

- 单元测试：`vitest`（packages/domain 纯函数）
- 集成测试：`playwright`（web 端关键流程）
- 小程序：微信官方测试框架

---

## 性能规范

### Web 端

- 服务端组件优先，减少客户端 JS
- 图片使用 `next/image`（自动优化）
- 列表页初始加载 ≤ 100 条

### 小程序端

- 图片使用 `lazyLoad` + `mode="aspectFill"`
- 分页每次加载 20 条
- 避免在 `useEffect` 中嵌套异步调用

---

## Git 规范

### Commit 格式

```
<type>(<scope>): <subject>

type: feat | fix | chore | docs | refactor | style | test
scope: web | miniprogram | packages | db
```

示例：
```
feat(miniprogram): add roaster detail page
fix(web): correct bean card image fallback
chore(packages): update shared-types exports
```

### 分支策略

- `main`：稳定版本
- `feat/*`：新功能
- `fix/*`：bug 修复

---

## 安全规范

- 所有 Supabase 查询必须通过 RLS（Row Level Security）
- API 路由必须验证 JWT token（`Authorization: Bearer <token>`）
- 禁止在客户端代码中暴露 `SUPABASE_SERVICE_ROLE_KEY`
- 小程序 `services/api.ts` 包含 placeholder 检测，防止意外提交测试地址
