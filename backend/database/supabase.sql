-- Execute no SQL Editor do Supabase quando quiser migrar.

create table if not exists public.campaigns (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_state (
  campaign_id text not null references public.campaigns(id) on delete cascade,
  state_key text not null,
  state_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (campaign_id, state_key)
);

create index if not exists idx_app_state_campaign on public.app_state(campaign_id);

insert into public.campaigns (id, name)
values ('main', 'Projeto Arachne')
on conflict (id) do nothing;

-- Para uso inicial somente pelo backend com SERVICE_ROLE, RLS pode ficar ativado sem políticas públicas.
alter table public.campaigns enable row level security;
alter table public.app_state enable row level security;

-- Futuramente, quando adicionar Supabase Auth, crie políticas por usuário/campanha.
