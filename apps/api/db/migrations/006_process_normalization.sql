alter table public.beans
  add column if not exists process_method_raw text,
  add column if not exists process_base text,
  add column if not exists process_style text;

create or replace function public.normalize_bean_process_fields()
returns trigger
language plpgsql
as $$
declare
  normalized_raw text;
  source_text text;
begin
  normalized_raw := nullif(btrim(coalesce(new.process_method_raw, new.process_method)), '');
  new.process_method_raw := normalized_raw;
  source_text := lower(coalesce(normalized_raw, ''));

  if new.process_base is null or new.process_base not in ('washed', 'natural', 'honey', 'other') then
    if source_text ~ '(honey|蜜处理|密处理|黄蜜|红蜜|黑蜜)' then
      new.process_base := 'honey';
    elsif source_text ~ '(^|[^a-z])(washed|wash)([^a-z]|$)|水洗' then
      new.process_base := 'washed';
    elsif source_text ~ '(^|[^a-z])natural([^a-z]|$)|日晒|日曬|晒处理|曬處理' then
      new.process_base := 'natural';
    else
      new.process_base := 'other';
    end if;
  end if;

  if new.process_style is null or new.process_style not in ('traditional', 'anaerobic', 'yeast', 'carbonic_maceration', 'thermal_shock', 'other') then
    if source_text ~ 'thermal[[:space:]]*shock|热冲击|熱衝擊' then
      new.process_style := 'thermal_shock';
    elsif source_text ~ 'carbonic|二氧化碳' then
      new.process_style := 'carbonic_maceration';
    elsif source_text ~ 'yeast|酵母' then
      new.process_style := 'yeast';
    elsif source_text ~ 'anaerobic|厌氧|厭氧' then
      new.process_style := 'anaerobic';
    elsif new.process_base = 'other' then
      new.process_style := 'other';
    else
      new.process_style := 'traditional';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_beans_normalize_process on public.beans;
create trigger trg_beans_normalize_process
before insert or update of process_method, process_method_raw, process_base, process_style
on public.beans
for each row execute function public.normalize_bean_process_fields();

update public.beans
set
  process_method_raw = coalesce(nullif(btrim(process_method_raw), ''), nullif(btrim(process_method), '')),
  process_base = nullif(btrim(process_base), ''),
  process_style = nullif(btrim(process_style), '');

create index if not exists idx_beans_process_base_style on public.beans (process_base, process_style);
