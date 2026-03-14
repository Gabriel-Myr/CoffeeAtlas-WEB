begin;

alter table public.roaster_beans
add column if not exists image_url text;

commit;
