# 数据层规范

> **Monorepo 路径说明**：本文档中所有 `lib/*` 路径均指 `apps/web/lib/*`。小程序端不直接访问 Supabase，通过 `apps/web/app/api/v1/` REST API 获取数据。

## Supabase 客户端

项目使用两个 Supabase 客户端实例：

### 1. supabaseBrowser（客户端）

用于客户端组件，使用匿名密钥（anon key）。

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
```

**使用场景**：
- 客户端组件中的数据查询
- 受 RLS 策略限制
- 只能访问公开数据

### 2. supabaseServer（服务端）

用于服务端组件和 API 路由，使用 service role key。

```typescript
// lib/supabase.ts
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

**使用场景**：
- 服务端组件中的数据查询
- API 路由
- 数据导入脚本
- 绕过 RLS 策略，拥有完整权限

## 类型定义

所有数据类型定义在 `lib/types.ts`：

```typescript
// lib/types.ts
export type PublishStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface Roaster {
  id: string;
  name: string;
  countryCode: string | null;
  city: string | null;
  websiteUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Bean {
  id: string;
  canonicalName: string;
  originCountry: string | null;
  originRegion: string | null;
  processMethod: string | null;
  variety: string | null;
  altitudeMinM: number | null;
  altitudeMaxM: number | null;
  flavorTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoasterBean {
  id: string;
  roasterId: string;
  beanId: string;
  displayName: string;
  roastLevel: string | null;
  priceAmount: number | null;
  priceCurrency: string;
  salesCount: number | null;
  productUrl: string | null;
  isInStock: boolean;
  status: PublishStatus;
  releaseAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## 数据获取模式

### 服务端数据获取

在服务端组件中直接使用 `supabaseServer`：

```typescript
// app/page.tsx
import { supabaseServer } from '@/lib/supabase';

export default async function HomePage() {
  const { data: beans } = await supabaseServer
    .from('roaster_beans')
    .select('*')
    .eq('status', 'ACTIVE')
    .limit(100);

  return <HomePageClient initialBeans={beans} />;
}
```

### 客户端数据获取

通过 API 路由获取数据：

```typescript
// app/api/beans/route.ts
import { supabaseServer } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { data, error } = await supabaseServer
    .from('roaster_beans')
    .select('*')
    .eq('status', 'ACTIVE');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
```

客户端调用：

```typescript
// 客户端组件
const response = await fetch('/api/beans');
const { data } = await response.json();
```

## 关联查询模式

推荐使用"批量查询 + Map 合并"模式，避免 N+1 查询：

```typescript
// lib/catalog.ts
export async function getCatalogBeans(limit?: number) {
  // 1. 查询主表
  const { data: rbData } = await supabaseServer
    .from('roaster_beans')
    .select('*')
    .eq('status', 'ACTIVE')
    .limit(limit);

  // 2. 提取关联 ID
  const roasterIds = [...new Set(rbData.map(r => r.roaster_id))];
  const beanIds = [...new Set(rbData.map(r => r.bean_id))];

  // 3. 批量查询关联表
  const [roastersRes, beansRes] = await Promise.all([
    supabaseServer.from('roasters').select('*').in('id', roasterIds),
    supabaseServer.from('beans').select('*').in('id', beanIds),
  ]);

  // 4. 构建 Map
  const roastersMap = new Map(roastersRes.data.map(r => [r.id, r]));
  const beansMap = new Map(beansRes.data.map(b => [b.id, b]));

  // 5. 合并数据
  return rbData.map(item => ({
    ...item,
    roaster: roastersMap.get(item.roaster_id),
    bean: beansMap.get(item.bean_id),
  }));
}
```

## 环境变量

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**注意**：
- `NEXT_PUBLIC_*` 前缀的变量会暴露到客户端
- `SUPABASE_SERVICE_ROLE_KEY` 不能暴露到客户端，只能在服务端使用
- 不要在代码中硬编码凭证

## 错误处理

```typescript
const { data, error } = await supabaseServer
  .from('roaster_beans')
  .select('*');

if (error) {
  console.error('Database error:', error);
  return { ok: false, error: error.message };
}

return { ok: true, data };
```
