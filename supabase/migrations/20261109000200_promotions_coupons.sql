-- P2: motor de cupones. Diseño anti-falsificación:
--   * El token se genera en el servidor con CSPRNG y NUNCA se guarda en claro.
--     En reposo solo vive su sha256 + un lookup público no reversible.
--   * El canje es un único UPDATE condicional sobre status, atómico y a prueba de carrera.
--   * redemptions es append-only y tiene FK restrict: no se puede borrar el rastro.

create table if not exists public.promotions (
  id                        uuid primary key default gen_random_uuid(),
  merchant_id               uuid not null references public.merchants(id) on delete cascade,
  title                     text not null check (length(trim(title)) between 3 and 140),
  description               text,
  discount_type             text not null check (discount_type in ('percent','amount')),
  discount_value            numeric(12,2) not null check (discount_value > 0),
  terms                     text,
  starts_at                 timestamptz not null default now(),
  ends_at                   timestamptz,
  max_redemptions           integer check (max_redemptions is null or max_redemptions > 0),
  max_redemptions_per_user  integer not null default 1 check (max_redemptions_per_user > 0),
  status                    text not null default 'draft'
                              check (status in ('draft','published','paused','expired')),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint promotions_window_valid check (ends_at is null or ends_at > starts_at),
  constraint promotions_percent_range check (discount_type <> 'percent' or discount_value <= 100)
);
create index if not exists idx_promotions_merchant on public.promotions(merchant_id);
create index if not exists idx_promotions_discovery
  on public.promotions(status, starts_at desc) where status = 'published';

drop trigger if exists trg_promotions_touch on public.promotions;
create trigger trg_promotions_touch before update on public.promotions
  for each row execute function public.touch_updated_at();

create table if not exists public.coupon_issues (
  id               uuid primary key default gen_random_uuid(),
  promotion_id     uuid not null references public.promotions(id) on delete cascade,
  merchant_id      uuid not null references public.merchants(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete set null,
  token_hash       text not null unique,
  status           text not null default 'issued'
                     check (status in ('issued','redeemed','expired','revoked')),
  issued_at        timestamptz not null default now(),
  expires_at       timestamptz,
  redeemed_at      timestamptz,
  redeemed_by      uuid references auth.users(id) on delete set null,
  redeemed_store_id uuid references public.stores(id) on delete set null
);
create index if not exists idx_coupon_issues_promotion on public.coupon_issues(promotion_id);
create index if not exists idx_coupon_issues_user on public.coupon_issues(user_id, issued_at desc);
create index if not exists idx_coupon_issues_merchant_status on public.coupon_issues(merchant_id, status);

-- Append-only. coupon_issue_id es UNIQUE: un cupón se canjea una sola vez, garantizado por la BD.
create table if not exists public.redemptions (
  id              uuid primary key default gen_random_uuid(),
  coupon_issue_id uuid not null unique references public.coupon_issues(id) on delete restrict,
  merchant_id     uuid not null references public.merchants(id) on delete restrict,
  store_id        uuid references public.stores(id) on delete set null,
  redeemed_by     uuid not null references auth.users(id) on delete restrict,
  redeemed_at     timestamptz not null default now()
);
create index if not exists idx_redemptions_merchant on public.redemptions(merchant_id, redeemed_at desc);

create or replace function public.coupon_issues_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'coupon_issues es inmutable en los campos de emisión';
end;
$$;

-- El token y su hash no se pueden reescribir después de emitido.
drop trigger if exists trg_coupon_issues_immutable on public.coupon_issues;
create trigger trg_coupon_issues_immutable before update on public.coupon_issues
  for each row
  when (old.token_hash <> new.token_hash
     or old.promotion_id <> new.promotion_id
     or old.user_id is distinct from new.user_id)
  execute function public.coupon_issues_immutable();

-- No se puede actualizar ni borrar el libro de canjes.
create or replace function public.redemptions_append_only() returns trigger
language plpgsql as $$
begin
  raise exception 'redemptions es append-only';
end;
$$;

drop trigger if exists trg_redemptions_append_only on public.redemptions;
create trigger trg_redemptions_append_only
  before update or delete on public.redemptions
  for each row execute function public.redemptions_append_only();

-- Canje atómico a prueba de carrera y de doble uso.
-- Devuelve la fila canjeada, o cero filas si ya estaba canjeado / expirado / revocado.
create or replace function public.redeem_coupon(
  p_token_hash  text,
  p_store_id    uuid default null
)
returns table (issue_id uuid, promotion_id uuid, merchant_id uuid, redeemed_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_issue public.coupon_issues;
  v_redeemer uuid := auth.uid();
begin
  if v_redeemer is null then
    raise exception 'se requiere sesión' using errcode = '42501';
  end if;

  update public.coupon_issues ci
     set status = 'redeemed',
         redeemed_at = now(),
         redeemed_by = v_redeemer,
         redeemed_store_id = p_store_id
   where ci.token_hash = p_token_hash
     and ci.status = 'issued'
     and (ci.expires_at is null or ci.expires_at > now())
  returning * into v_issue;

  if v_issue.id is null then
    return;
  end if;

  if not public.can_manage_merchant(v_issue.merchant_id) then
    raise exception 'no autorizado para validar cupones de este comercio'
      using errcode = '42501';
  end if;

  insert into public.redemptions (coupon_issue_id, merchant_id, store_id, redeemed_by)
  values (v_issue.id, v_issue.merchant_id, p_store_id, v_redeemer);

  return query select v_issue.id, v_issue.promotion_id, v_issue.merchant_id, v_issue.redeemed_at;
end;
$$;

revoke all on function public.redeem_coupon(text, uuid) from public, anon;
grant execute on function public.redeem_coupon(text, uuid) to authenticated;
