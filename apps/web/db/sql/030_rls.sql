-- Enable RLS.
alter table public.sources enable row level security;
alter table public.roasters enable row level security;
alter table public.roaster_source_bindings enable row level security;
alter table public.beans enable row level security;
alter table public.bean_aliases enable row level security;
alter table public.roaster_beans enable row level security;
alter table public.price_snapshots enable row level security;
alter table public.import_jobs enable row level security;
alter table public.ingestion_events enable row level security;
alter table public.change_requests enable row level security;
alter table public.app_users enable row level security;
alter table public.user_favorites enable row level security;

-- Custom role check from JWT app metadata.
create or replace function public.has_platform_role(required_roles text[])
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'platform_role') = any(required_roles), false);
$$;

-- Public read policies for published catalog.
drop policy if exists roasters_public_read on public.roasters;
create policy roasters_public_read
on public.roasters
for select
to anon, authenticated
using (is_public = true);

drop policy if exists beans_public_read on public.beans;
create policy beans_public_read
on public.beans
for select
to anon, authenticated
using (is_public = true);

drop policy if exists roaster_beans_public_read on public.roaster_beans;
create policy roaster_beans_public_read
on public.roaster_beans
for select
to anon, authenticated
using (status = 'ACTIVE' and is_in_stock = true);

-- Admin/editor policies.
drop policy if exists roasters_admin_all on public.roasters;
create policy roasters_admin_all
on public.roasters
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

drop policy if exists beans_admin_all on public.beans;
create policy beans_admin_all
on public.beans
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

drop policy if exists roaster_beans_admin_all on public.roaster_beans;
create policy roaster_beans_admin_all
on public.roaster_beans
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

drop policy if exists bean_aliases_admin_all on public.bean_aliases;
create policy bean_aliases_admin_all
on public.bean_aliases
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

drop policy if exists sources_admin_all on public.sources;
create policy sources_admin_all
on public.sources
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

drop policy if exists roaster_source_bindings_admin_all on public.roaster_source_bindings;
create policy roaster_source_bindings_admin_all
on public.roaster_source_bindings
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

drop policy if exists price_snapshots_admin_all on public.price_snapshots;
create policy price_snapshots_admin_all
on public.price_snapshots
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

drop policy if exists import_jobs_admin_all on public.import_jobs;
create policy import_jobs_admin_all
on public.import_jobs
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

drop policy if exists ingestion_events_admin_all on public.ingestion_events;
create policy ingestion_events_admin_all
on public.ingestion_events
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));

drop policy if exists change_requests_admin_all on public.change_requests;
create policy change_requests_admin_all
on public.change_requests
for all
to authenticated
using (public.has_platform_role(array['admin', 'editor']))
with check (public.has_platform_role(array['admin', 'editor']));
