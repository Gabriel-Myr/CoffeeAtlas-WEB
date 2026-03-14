# 导入脚本规范

## 脚本位置

所有数据导入脚本位于 `scripts/` 目录。

## 通用脚本

### 1. import-roasters.ts

导入烘焙商基础数据。

**用途**：批量创建烘焙商记录

**数据格式**：
```typescript
const roasters = [
  {
    name: 'LAVAZZA',
    name_en: 'LAVAZZA',
    country_code: 'IT',
    city: '都灵',
    description: '意大利顶级咖啡品牌...',
    website_url: 'https://www.lavazza.com',
    is_public: true
  },
  // ...
];
```

**执行方式**：
```bash
tsx scripts/import-roasters.ts
```

**注意事项**：
- 使用 `supabaseServer` 客户端
- 需要配置 `SUPABASE_SERVICE_ROLE_KEY` 环境变量
- 不要硬编码凭证

---

### 2. import-beans.ts

导入咖啡豆基础数据和产品关联。

**用途**：
- 创建咖啡豆基础数据（beans 表）
- 创建烘焙商-咖啡豆关联（roaster_beans 表）

**数据格式**：
```typescript
// 咖啡豆基础数据
const beansData = [
  {
    canonical_name: 'Ethiopia Yirgacheffe',
    canonical_name_en: 'Ethiopia Yirgacheffe',
    origin_country: 'Ethiopia',
    origin_region: 'Yirgacheffe',
    process_method: 'Washed',
    variety: 'Heirloom',
    flavor_tags: ['jasmine', 'lemon', 'tea', 'floral'],
    altitude_min_m: 1700,
    altitude_max_m: 2200,
    harvest_year: 2024
  },
  // ...
];

// 烘焙商产品配置
const roasterProducts = {
  'LAVAZZA': [
    {
      beanName: 'Italy Espresso Blend',
      displayName: '意式浓缩拼配',
      roastLevel: '深烘',
      priceAmount: 89,
      priceCurrency: 'CNY',
      weightGrams: 250,
      isInStock: true
    },
    // ...
  ],
  // ...
};
```

**执行方式**：
```bash
tsx scripts/import-beans.ts
```

**逻辑流程**：
1. 获取所有烘焙商
2. 插入咖啡豆基础数据（去重）
3. 根据 `roasterProducts` 配置创建 roaster_beans 关联
4. 避免重复插入（检查 roaster_id + bean_id + display_name）

---

### 3. import-sales.ts

导入销量数据。

**用途**：更新 roaster_beans 表的 sales_count 字段

**数据格式**：
```typescript
interface SalesData {
  roasterName: string;
  displayName: string;
  salesCount: number;
}
```

**执行方式**：
```bash
tsx scripts/import-sales.ts
```

---

## 从 Excel/CSV 导入

### 数据格式要求

使用 `ImportInputRow` 接口（定义在 `lib/types.ts`）：

```typescript
export interface ImportInputRow {
  roasterName: string;           // 必填
  city?: string | null;
  countryCode?: string | null;
  beanName: string;              // 必填
  originCountry?: string | null;
  originRegion?: string | null;
  processMethod?: string | null;
  variety?: string | null;
  displayName: string;           // 必填
  roastLevel?: string | null;
  priceAmount?: number | null;
  priceCurrency?: string | null;
  isInStock?: boolean;
  status?: PublishStatus;
  productUrl?: string | null;
  flavorTags?: string[] | null;
  sourceUrl?: string | null;
}
```

### Excel 读取示例

```typescript
import * as XLSX from 'xlsx';

const workbook = XLSX.readFile('/path/to/file.xlsx');
const sheetName = workbook.SheetNames[0];
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

// 处理每一行
for (const row of data) {
  const inputRow: ImportInputRow = {
    roasterName: row['烘焙商名称'],
    beanName: row['咖啡豆名称'],
    displayName: row['产品名称'],
    originCountry: row['产地'],
    variety: row['品种'],
    processMethod: row['处理法'],
    priceAmount: parseFloat(row['价格']),
    // ...
  };

  // 导入逻辑
}
```

## 安全规范

### ⚠️ 禁止硬编码凭证

❌ **错误示例**：
```typescript
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

✅ **正确示例**：
```typescript
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
```

### 环境变量配置

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 错误处理

```typescript
const { data, error } = await supabase
  .from('roasters')
  .insert(roasters)
  .select();

if (error) {
  console.error('插入数据时出错:', error);
  process.exit(1);
}

console.log(`成功插入 ${data.length} 条记录`);
```

## 执行顺序建议

1. **import-roasters.ts** - 先导入烘焙商
2. **import-beans.ts** - 再导入咖啡豆和产品关联
3. **import-sales.ts** - 最后更新销量数据
