-- Deprecated cleanup migration.
-- The fields previously targeted here are now consumed by the web API,
-- import scripts, or miniprogram integration flow.
-- Keep this file as a no-op so older runbooks do not accidentally
-- remove live columns from production or staging.

select 'Skipped deprecated cleanup migration' as status;
