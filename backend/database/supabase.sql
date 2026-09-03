-- RPG Arachne v31.1 — banco multi-campanha (schema preservado).
-- Execute no SQL Editor do Supabase.

create table if not exists public.campaigns (
  id text primary key,
  code text not null unique,
  name text not null,
  password_hash text,
  template text not null default 'arachne',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migração segura para quem já possui a tabela antiga.
alter table public.campaigns add column if not exists code text;
alter table public.campaigns add column if not exists password_hash text;
alter table public.campaigns add column if not exists template text not null default 'arachne';
create unique index if not exists idx_campaigns_code on public.campaigns(code);

create table if not exists public.app_state (
  campaign_id text not null references public.campaigns(id) on delete cascade,
  state_key text not null,
  state_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (campaign_id, state_key)
);
create index if not exists idx_app_state_campaign on public.app_state(campaign_id);

-- O backend usa SERVICE_ROLE. Nenhuma chave do Supabase vai para o navegador.
alter table public.campaigns enable row level security;
alter table public.app_state enable row level security;
