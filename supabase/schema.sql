-- ================================================================
-- TUDO JUNTO — Schema Supabase
-- Execute no SQL Editor do seu projeto Supabase
-- ================================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- PROFILES
-- ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────────
-- CONVERSATIONS
-- ────────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null default 'Nova conversa',
  model_id text not null default '',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_id_idx on public.conversations(user_id);
create index if not exists conversations_updated_at_idx on public.conversations(updated_at desc);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.handle_updated_at();

-- ────────────────────────────────────────────────────────────────
-- USAGE (daily message counter)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null default current_date,
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

create index if not exists usage_user_date_idx on public.usage(user_id, date);

-- ────────────────────────────────────────────────────────────────
-- RLS (Row Level Security)
-- ────────────────────────────────────────────────────────────────

-- Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Conversations
alter table public.conversations enable row level security;

create policy "Users can manage own conversations"
  on public.conversations for all using (auth.uid() = user_id);

-- Usage
alter table public.usage enable row level security;

create policy "Users can view own usage"
  on public.usage for select using (auth.uid() = user_id);

create policy "Users can insert own usage"
  on public.usage for insert with check (auth.uid() = user_id);

create policy "Users can update own usage"
  on public.usage for update using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- SERVICE ROLE BYPASS (for webhooks)
-- ────────────────────────────────────────────────────────────────
-- The service role key bypasses RLS automatically.
-- No additional policies needed.

-- ================================================================
-- Pronto! Execute este SQL no Supabase SQL Editor.
-- ================================================================
