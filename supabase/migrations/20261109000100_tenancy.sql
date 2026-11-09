-- P1: núcleo multi-comercio. Raíz de tenencia: merchants -> stores / memberships.
-- Idempotente. No destructivo. No se aplica sin acceso administrativo.

create extension if not exists pgcrypto;

create table if not exists public.merchants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) between 2 and 120),
  slug        text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,60}$'),
  status      text not null default 'active' check (status in ('active','suspended')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.stores (
  id          uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  name        text not null check (length(trim(name)) between 1 and 120),
  address     text,
  comuna      text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_stores_merchant on public.stores(merchant_id);

-- Quién pertenece a qué comercio y con qué rol. El rol vive aquí, no en auth.users.
create table if not exists public.memberships (
  id          uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'staff' check (role in ('owner','manager','staff')),
  created_at  timestamptz not null default now(),
  unique (merchant_id, user_id)
);
create index if not exists idx_memberships_user on public.memberships(user_id);

-- Un comercio debe tener exactamente un owner.
create unique index if not exists idx_memberships_single_owner
  on public.memberships(merchant_id) where role = 'owner';

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_merchants_touch on public.merchants;
create trigger trg_merchants_touch before update on public.merchants
  for each row execute function public.touch_updated_at();

-- Helpers usados por las políticas RLS. SECURITY DEFINER para poder leer memberships
-- sin recursión infinita de políticas.
create or replace function public.is_merchant_member(p_merchant_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.memberships
    where merchant_id = p_merchant_id and user_id = auth.uid()
  );
$$;

create or replace function public.merchant_role(p_merchant_id uuid)
returns text language sql security definer stable set search_path = public as $$
  select role from public.memberships
  where merchant_id = p_merchant_id and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.can_manage_merchant(p_merchant_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce(public.merchant_role(p_merchant_id) in ('owner','manager'), false);
$$;
