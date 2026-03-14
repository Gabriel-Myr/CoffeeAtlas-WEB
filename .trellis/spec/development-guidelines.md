# 开发规范

## Monorepo 开发规范

### 包管理

使用 pnpm workspace + Turborepo：

```bash
# 在特定包中安装依赖
pnpm --filter <package-name> add <dep>

# 添加内部包依赖
pnpm --filter @coffeeatlas/miniprogram add @coffee-atlas/api-client

# 运行特定包的命令
pnpm --filter coffeestories-webdb dev

# 全量构建（Turborepo 自动处理依赖顺序）
pnpm turbo build

# 全量类型检查
pnpm turbo typecheck
```

### 包命名规范

| 包路径 | 包名 | 用途 |
|--------|------|------|
| `apps/web` | `coffeestories-webdb` | Next.js Web 应用 |
| `apps/miniprogram` | `@coffeeatlas/miniprogram` | Taro 小程序 |
| `packages/shared-types` | `@coffee-atlas/shared-types` | 共享类型定义 |
| `packages/api-client` | `@coffee-atlas/api-client` | API 客户端 |
| `packages/domain` | `@coffee-atlas/domain` | 领域逻辑 |

### 代码归属原则

- **Web 专用逻辑** → `apps/web/lib/` 或 `apps/web/app/`
- **小程序专用逻辑** → `apps/miniprogram/src/`
- **两端共用类型** → `packages/shared-types/src/`
- **两端共用 API 调用** → `packages/api-client/src/`
- **业务领域逻辑** → `packages/domain/src/`

### 共享包导入

```typescript
// ✅ 从共享包导入类型
import type { CatalogBeanCard, ApiResponse } from '@coffee-atlas/shared-types';

// ✅ 使用 API 客户端（小程序端）
import { ApiClient } from '@coffee-atlas/api-client';

// ❌ 跨 app 直接引用
import { something } from '../../apps/web/lib/catalog';
```

---

## TypeScript 配置

### 严格模式

项目启用 TypeScript 严格模式：

```json
{
  "compilerOptions": {
    "strict": true,
    "allowJs": false,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "jsx": "react-jsx"
  }
}
```

### 类型安全要求

- ✅ 所有函数参数和返回值必须有类型注解
- ✅ 禁止使用 `any`（除非有充分理由）
- ✅ 使用 `@coffee-atlas/shared-types` 中定义的共享类型，或各包内的本地类型
- ❌ 不允许 `allowJs: true`

## 代码风格

### 命名规范

- **组件**: PascalCase（如 `HomePageClient.tsx`）
- **文件**:
  - 组件文件：PascalCase（如 `AddBeanForm.tsx`）
  - 路由文件：kebab-case（如 `all-beans/page.tsx`）
  - 工具文件：kebab-case（如 `supabase.ts`）
- **变量/函数**: camelCase（如 `getCatalogBeans`）
- **常量**: UPPER_SNAKE_CASE（如 `MAX_BEANS_PER_PAGE`）
- **类型/接口**: PascalCase（如 `CoffeeBean`, `PublishStatus`）

### 注释规范

- **不主动添加注释**（遵循全局 CLAUDE.md 配置）
- 只在逻辑复杂、不易理解的地方添加注释
- 使用中文注释

```typescript
// ✅ 好的注释：解释"为什么"
// 使用 Map 避免 N+1 查询问题
const roastersMap = new Map(roasters.map(r => [r.id, r]));

// ❌ 不必要的注释：重复代码内容
// 创建一个 Map
const roastersMap = new Map(roasters.map(r => [r.id, r]));
```

## 文件操作规则

1. **修改文件前先读取**：使用 Read 工具查看现有内容
2. **优先编辑现有文件**：不要轻易创建新文件
3. **不创建文档文件**：除非用户明确要求，不创建 README 或其他文档

## 环境变量

### 命名规范

- 客户端可见：`NEXT_PUBLIC_*` 前缀
- 服务端专用：无前缀

### 使用示例

```typescript
// ✅ 正确：使用环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing environment variables');
}

// ❌ 错误：硬编码凭证
const supabaseUrl = 'https://xxx.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 必需的环境变量

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=         # Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # 匿名密钥（客户端）
SUPABASE_SERVICE_ROLE_KEY=        # Service Role 密钥（服务端）
```

## 导入路径

使用 `@/*` 别名：

```typescript
// ✅ 推荐
import { supabaseBrowser } from '@/lib/supabase';
import { CoffeeBean } from '@/lib/types';

// ❌ 避免相对路径
import { supabaseBrowser } from '../../lib/supabase';
```

## 组件规范

### 客户端组件标记

需要交互的组件必须标记 `'use client'`：

```typescript
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  // ...
}
```

### Props 类型定义

```typescript
interface HomePageClientProps {
  initialBeans: CoffeeBean[];
  theme?: ThemeOption;
}

export default function HomePageClient({
  initialBeans,
  theme = 'warm'
}: HomePageClientProps) {
  // ...
}
```

## 错误处理

### API 路由

```typescript
// app/api/beans/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('roaster_beans')
      .select('*');

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 数据获取

```typescript
const { data, error } = await supabaseServer
  .from('roaster_beans')
  .select('*');

if (error) {
  console.error('Database error:', error);
  return [];
}

return data;
```

## Git 提交规范

使用约定式提交（Conventional Commits）：

```bash
feat: 添加咖啡豆搜索功能
fix: 修复主题切换时的样式问题
chore: 更新依赖版本
docs: 更新 README
refactor: 重构数据获取逻辑
```

## 代码质量检查

### 运行 Lint

```bash
# 单包
pnpm --filter coffeestories-webdb lint

# 全量
pnpm turbo lint
```

### 类型检查

```bash
# 单包
pnpm --filter coffeestories-webdb typecheck

# 全量（按依赖顺序）
pnpm turbo typecheck
```

## 性能优化建议

1. **使用 useMemo 缓存计算结果**
2. **避免在循环中进行数据库查询**（使用批量查询 + Map）
3. **图片使用 Next.js Image 组件**
4. **大列表使用虚拟滚动**（如需要）

## 安全规范

1. **不要在客户端暴露 service role key**
2. **使用 RLS 策略保护数据**
3. **验证用户输入**
4. **不要在代码中硬编码敏感信息**
