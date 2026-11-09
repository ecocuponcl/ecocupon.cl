-- Tablas que el código ya consulta pero que no existen en la base.
-- Reconstruidas desde scripts/ con nombres de índice/política unificados.
-- Todas idempotentes y no destructivas.

-- products.plate (la consulta app/api/plate/route.ts la usa hoy y falla con 42703)
alter table public.products add column if not exists plate text;
create index if not exists idx_products_plate on public.products(plate);

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  points       integer not null default 0 check (points >= 0),
  plan         text not null default 'free' check (plan in ('free','pro')),
  daily_scans  integer not null default 0 check (daily_scans >= 0),
  last_scan_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.recycling_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  plate        text,
  material     text,
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  points       integer not null default 0,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at   timestamptz not null default now()
);
create index if not exists idx_recycling_events_user_id on public.recycling_events(user_id);
create index if not exists idx_recycling_events_created_at on public.recycling_events(created_at desc);
create index if not exists idx_recycling_events_plate on public.recycling_events(plate);

create table if not exists public.plate_detection_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  detected_plate text,
  confidence     numeric(5,4) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  source         text,
  created_at     timestamptz not null default now()
);
create index if not exists idx_plate_logs_user_id on public.plate_detection_logs(user_id);
create index if not exists idx_plate_logs_created_at on public.plate_detection_logs(created_at desc);
create index if not exists idx_plate_logs_user_date on public.plate_detection_logs(user_id, created_at desc);
create index if not exists idx_plate_logs_plate on public.plate_detection_logs(detected_plate);

create table if not exists public.upload_tracking (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  object_path text not null,
  byte_size  bigint check (byte_size is null or byte_size >= 0),
  created_at timestamptz not null default now()
);
create index if not exists idx_upload_tracking_user_date on public.upload_tracking(user_id, created_at desc);

alter table public.profiles             enable row level security;
alter table public.recycling_events     enable row level security;
alter table public.plate_detection_logs enable row level security;
alter table public.upload_tracking      enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists recycling_select_own on public.recycling_events;
create policy recycling_select_own on public.recycling_events for select to authenticated
  using (user_id = auth.uid());
drop policy if exists recycling_insert_own on public.recycling_events;
create policy recycling_insert_own on public.recycling_events for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists plate_logs_select_own on public.plate_detection_logs;
create policy plate_logs_select_own on public.plate_detection_logs for select to authenticated
  using (user_id = auth.uid());

drop policy if exists uploads_select_own on public.upload_tracking;
create policy uploads_select_own on public.upload_tracking for select to authenticated
  using (user_id = auth.uid());
drop policy if exists uploads_insert_own on public.upload_tracking;
create policy uploads_insert_own on public.upload_tracking for insert to authenticated
  with check (user_id = auth.uid());

-- products/categories/knasta_prices ya existen sin RLS declarada en el repo.
alter table public.products       enable row level security;
alter table public.categories     enable row level security;
alter table public.knasta_prices  enable row level security;

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products for select to anon, authenticated using (true);
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated using (true);
drop policy if exists knasta_public_read on public.knasta_prices;
create policy knasta_public_read on public.knasta_prices for select to anon, authenticated using (true);
