-- 删除未使用字段的迁移脚本
-- 执行前请备份数据

-- === roasters 表 ===
ALTER TABLE public.roasters DROP COLUMN IF EXISTS slug;
ALTER TABLE public.roasters DROP COLUMN IF EXISTS instagram_handle;
ALTER TABLE public.roasters DROP COLUMN IF EXISTS logo_url;

-- === beans 表 ===
ALTER TABLE public.beans DROP COLUMN IF EXISTS canonical_name_en;
ALTER TABLE public.beans DROP COLUMN IF EXISTS producer;
ALTER TABLE public.beans DROP COLUMN IF EXISTS altitude_min_m;
ALTER TABLE public.beans DROP COLUMN IF EXISTS altitude_max_m;

-- === roaster_beans 表 ===
ALTER TABLE public.roaster_beans DROP COLUMN IF EXISTS source_id;
ALTER TABLE public.roaster_beans DROP COLUMN IF EXISTS weight_grams;
ALTER TABLE public.roaster_beans DROP COLUMN IF EXISTS release_at;
ALTER TABLE public.roaster_beans DROP COLUMN IF EXISTS retire_at;
ALTER TABLE public.roaster_beans DROP COLUMN IF EXISTS created_by;
ALTER TABLE public.roaster_beans DROP COLUMN IF EXISTS sales_count;

-- 验证
SELECT 'Done' as status;
