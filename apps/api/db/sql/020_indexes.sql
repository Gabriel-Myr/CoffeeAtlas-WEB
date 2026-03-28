-- Core relational indexes.
create index if not exists idx_roaster_beans_roaster_id on public.roaster_beans (roaster_id);
create index if not exists idx_roaster_beans_bean_id on public.roaster_beans (bean_id);
create index if not exists idx_roaster_beans_status_stock_release on public.roaster_beans (status, is_in_stock, release_at desc);
create index if not exists idx_roaster_beans_price_amount on public.roaster_beans (price_amount);
create index if not exists idx_roaster_source_bindings_roaster_id on public.roaster_source_bindings (roaster_id);
create index if not exists idx_roaster_source_bindings_source_id on public.roaster_source_bindings (source_id);
create index if not exists idx_roaster_source_bindings_active_sync on public.roaster_source_bindings (is_active, last_synced_at desc);
create unique index if not exists idx_roaster_beans_source_identity_unique
on public.roaster_beans (source_id, source_item_id, coalesce(source_sku_id, ''))
where source_id is not null and source_item_id is not null;

create index if not exists idx_roasters_city_country on public.roasters (city, country_code);
create index if not exists idx_roasters_is_public on public.roasters (is_public);

create index if not exists idx_beans_origin_process on public.beans (origin_country, process_method);
create index if not exists idx_beans_process_base_style on public.beans (process_base, process_style);
create index if not exists idx_beans_variety on public.beans (variety);
create index if not exists idx_beans_is_public on public.beans (is_public);

create index if not exists idx_price_snapshots_rb_captured on public.price_snapshots (roaster_bean_id, captured_at desc);
create index if not exists idx_import_jobs_status_created on public.import_jobs (status, created_at desc);
create index if not exists idx_ingestion_events_created on public.ingestion_events (created_at desc);
create index if not exists idx_change_requests_status_created on public.change_requests (status, created_at desc);
create index if not exists idx_app_users_openid on public.app_users (wechat_openid);
create index if not exists idx_user_favorites_user_created on public.user_favorites (user_id, created_at desc);
create index if not exists idx_user_favorites_target on public.user_favorites (target_type, target_id);

-- Full text indexes.
create index if not exists idx_roasters_search_tsv on public.roasters using gin (search_tsv);
create index if not exists idx_beans_search_tsv on public.beans using gin (search_tsv);
create index if not exists idx_roaster_beans_search_tsv on public.roaster_beans using gin (search_tsv);

-- Fuzzy search indexes (trigram).
create index if not exists idx_roasters_name_trgm on public.roasters using gin (name gin_trgm_ops);
create index if not exists idx_beans_name_trgm on public.beans using gin (canonical_name gin_trgm_ops);
create index if not exists idx_roaster_beans_display_name_trgm on public.roaster_beans using gin (display_name gin_trgm_ops);
create index if not exists idx_bean_aliases_alias_trgm on public.bean_aliases using gin (alias gin_trgm_ops);
