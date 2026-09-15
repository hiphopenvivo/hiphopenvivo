create table if not exists public.hhv_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null,
  source_url text,
  inbox_row bigint,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'PENDIENTE' check (status in ('PENDIENTE','PROCESANDO','COMPLETO','ERROR','PAUSADO')),
  priority integer not null default 100,
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  last_error text,
  provider text,
  idempotency_key text,
  correlation_id uuid not null default gen_random_uuid(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create unique index if not exists hhv_jobs_idempotency_key_unique
  on public.hhv_jobs (idempotency_key)
  where idempotency_key is not null;

create index if not exists hhv_jobs_claim_idx
  on public.hhv_jobs (status, available_at, priority, created_at);
create index if not exists hhv_jobs_inbox_row_idx on public.hhv_jobs (inbox_row);
create index if not exists hhv_jobs_source_url_idx on public.hhv_jobs (source_url);

create table if not exists public.hhv_provider_health (
  provider text primary key,
  service_role text not null,
  status text not null default 'OK' check (status in ('OK','DEGRADED','QUOTA_WARNING','DOWN','DISABLED')),
  is_primary boolean not null default false,
  priority integer not null default 100,
  quota_percent numeric,
  consecutive_failures integer not null default 0,
  last_ok_at timestamptz,
  last_error_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.hhv_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hhv_jobs_set_updated_at on public.hhv_jobs;
create trigger hhv_jobs_set_updated_at
before update on public.hhv_jobs
for each row execute function public.hhv_set_updated_at();

drop trigger if exists hhv_provider_health_set_updated_at on public.hhv_provider_health;
create trigger hhv_provider_health_set_updated_at
before update on public.hhv_provider_health
for each row execute function public.hhv_set_updated_at();

create or replace function public.hhv_claim_jobs(p_worker_id text, p_limit integer default 1)
returns setof public.hhv_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with picked as (
    select j.id
    from public.hhv_jobs j
    where j.status = 'PENDIENTE'
      and j.available_at <= now()
      and j.attempts < j.max_attempts
    order by j.priority asc, j.created_at asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 1), 50))
  ), updated as (
    update public.hhv_jobs j
    set status = 'PROCESANDO',
        locked_at = now(),
        locked_by = p_worker_id,
        attempts = j.attempts + 1
    from picked
    where j.id = picked.id
    returning j.*
  )
  select * from updated;
end;
$$;

create or replace function public.hhv_requeue_stale_jobs(p_stale_minutes integer default 30)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.hhv_jobs
  set status = case when attempts >= max_attempts then 'ERROR' else 'PENDIENTE' end,
      locked_at = null,
      locked_by = null,
      available_at = case when attempts >= max_attempts then available_at else now() end,
      last_error = coalesce(last_error, 'Requeued after stale processing lock')
  where status = 'PROCESANDO'
    and locked_at is not null
    and locked_at < now() - make_interval(mins => greatest(1, coalesce(p_stale_minutes, 30)));

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

alter table public.hhv_jobs enable row level security;
alter table public.hhv_provider_health enable row level security;

revoke all on function public.hhv_claim_jobs(text, integer) from public, anon, authenticated;
revoke all on function public.hhv_requeue_stale_jobs(integer) from public, anon, authenticated;
grant execute on function public.hhv_claim_jobs(text, integer) to service_role;
grant execute on function public.hhv_requeue_stale_jobs(integer) to service_role;
