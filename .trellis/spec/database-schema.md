# 数据库架构

## 技术栈

- **数据库**: PostgreSQL (Supabase)
- **ORM/客户端**: @supabase/supabase-js
- **迁移管理**: SQL 脚本（手动执行）

## 核心表结构

### 1. roasters（烘焙商）

存储咖啡烘焙商的基本信息。

```sql
CREATE TABLE roasters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 烘焙商名称
  name_en TEXT,                          -- 英文名称
  slug TEXT UNIQUE,                      -- URL 友好的标识符
  country_code CHAR(2),                  -- 国家代码（ISO 3166-1）
  city TEXT,                             -- 城市
  description TEXT,                      -- 描述
  website_url TEXT,                      -- 官网
  instagram_handle TEXT,                 -- Instagram 账号
  logo_url TEXT,                         -- Logo URL
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_tsv TSVECTOR                    -- 全文搜索向量
);
```

### 2. beans（咖啡豆）

存储咖啡豆的基础信息（产地、品种、处理法等）。

```sql
CREATE TABLE beans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name TEXT NOT NULL,          -- 标准名称
  canonical_name_en TEXT,                -- 英文名称
  origin_country TEXT,                   -- 产地国家
  origin_region TEXT,                    -- 产地地区
  farm TEXT,                             -- 庄园/农场
  producer TEXT,                         -- 生产者
  variety TEXT,                          -- 品种（如 Geisha, Bourbon）
  process_method TEXT,                   -- 处理法（水洗、日晒、蜜处理等）
  altitude_min_m INT,                    -- 最低海拔（米）
  altitude_max_m INT,                    -- 最高海拔（米）
  harvest_year SMALLINT,                 -- 产季年份
  flavor_tags TEXT[] NOT NULL DEFAULT '{}', -- 风味标签
  notes TEXT,                            -- 备注
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_tsv TSVECTOR
);
```

### 3. roaster_beans（烘焙商-咖啡豆关联）

存储烘焙商销售的具体咖啡豆产品信息。

```sql
CREATE TABLE roaster_beans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roaster_id UUID NOT NULL REFERENCES roasters(id) ON DELETE CASCADE,
  bean_id UUID NOT NULL REFERENCES beans(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,            -- 产品展示名称
  roast_level TEXT,                      -- 烘焙度（浅烘、中烘、深烘）
  price_amount NUMERIC(10,2),            -- 价格
  price_currency TEXT NOT NULL DEFAULT 'CNY',
  weight_grams INT,                      -- 重量（克）
  sales_count INT,                       -- 销量
  product_url TEXT,                      -- 商品链接
  image_url TEXT,                        -- 商品图片
  is_in_stock BOOLEAN NOT NULL DEFAULT true,
  status publish_status NOT NULL DEFAULT 'DRAFT',
  release_at TIMESTAMPTZ,                -- 发布时间
  original_price NUMERIC(10,2),          -- 原价
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 4. sources（数据源）

记录数据来源（官网、电商平台、手动录入等）。

```sql
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type source_type NOT NULL,      -- 数据源类型
  source_name TEXT NOT NULL,             -- 数据源名称
  source_url TEXT,                       -- 数据源 URL
  owner_label TEXT,                      -- 所有者标签
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_name)
);
```

## 枚举类型

### publish_status
```sql
CREATE TYPE publish_status AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
```

### source_type
```sql
CREATE TYPE source_type AS ENUM (
  'MANUAL',           -- 手动录入
  'OFFICIAL_SITE',    -- 官方网站
  'ECOMMERCE',        -- 电商平台
  'SOCIAL',           -- 社交媒体
  'IMPORT_FILE',      -- 导入文件
  'OTHER'             -- 其他
);
```

### import_job_status
```sql
CREATE TYPE import_job_status AS ENUM (
  'PENDING',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'PARTIAL'
);
```

## 索引

```sql
-- roasters 表索引
CREATE INDEX idx_roasters_name ON roasters(name);
CREATE INDEX idx_roasters_country ON roasters(country_code);
CREATE INDEX idx_roasters_search ON roasters USING gin(search_tsv);

-- beans 表索引
CREATE INDEX idx_beans_origin_country ON beans(origin_country);
CREATE INDEX idx_beans_variety ON beans(variety);
CREATE INDEX idx_beans_search ON beans USING gin(search_tsv);

-- roaster_beans 表索引
CREATE INDEX idx_roaster_beans_roaster ON roaster_beans(roaster_id);
CREATE INDEX idx_roaster_beans_bean ON roaster_beans(bean_id);
CREATE INDEX idx_roaster_beans_status ON roaster_beans(status);
```

## RLS（行级安全）

- 公开数据（`is_public = true`）允许匿名读取
- 写操作需要 service_role 权限
- 详见 `db/sql/030_rls.sql`

## 迁移顺序

按以下顺序执行 SQL 文件：

1. **001_extensions.sql** - 启用 PostgreSQL 扩展（uuid-ossp, pg_trgm 等）
2. **010_schema.sql** - 创建表和枚举类型
3. **020_indexes.sql** - 创建索引
4. **030_rls.sql** - 配置行级安全策略
5. **040_views_and_functions.sql** - 创建视图和函数
6. **050_seed_minimal.sql** - 插入初始数据（可选）
