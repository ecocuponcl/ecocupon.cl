-- Correcciones de la revisión Goldfish de seguridad (2026-11-09).
-- 1. redeem_coupon autorizaba después de mutar: un usuario de otro comercio
--    distinguía token válido (403) de inexistente (404). Ahora autoriza antes
--    de tocar la fila y responde igual en ambos casos.
-- 2. p_store_id se escribía sin verificar tenencia; redemptions es append-only,
--    así que una atribución cruzada sería incorregible.
-- 3. La emisión no miraba merchants.status y el canje no miraba el estado
--    actual de la promoción.
-- 4. Las políticas públicas exponían todas las columnas de promotions.
-- 5. `for all` en RLS permitía borrar la membership del owner y las promociones.

create or replace function public.redeem_coupon(
  p_token_hash text,
  p_store_id   uuid default null
)
returns table (issue_id uuid, promotion_id uuid, merchant_id uuid, redeemed_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_issue     public.coupon_issues;
  v_promo     public.promotions;
  v_redeemer  uuid := auth.uid();
  v_status    text;
  v_redeemed  timestamptz;
begin
  if v_redeemer is null then
    raise exception 'se requiere sesión' using errcode = '42501';
  end if;

  select * into v_issue
    from public.coupon_issues
   where token_hash = p_token_hash
   for update;

  -- Misma respuesta para inexistente, ajeno y ya canjeado: no se revela la
  -- existencia de cupones de otros comercios.
  if v_issue.id is null or not public.can_manage_merchant(v_issue.merchant_id) then
    return;
  end if;

  if v_issue.status <> 'issued' then
    return;
  end if;

  if v_issue.expires_at is not null and v_issue.expires_at <= now() then
    update public.coupon_issues set status = 'expired' where id = v_issue.id;
    return;
  end if;

  select * into v_promo from public.promotions where id = v_issue.promotion_id;
  if v_promo.status <> 'published'
     or (v_promo.ends_at is not null and v_promo.ends_at <= now()) then
    return;
  end if;

  select m.status into v_status from public.merchants m where m.id = v_issue.merchant_id;
  if v_status is distinct from 'active' then
    return;
  end if;

  if p_store_id is not null then
    if not exists (
      select 1 from public.stores
       where id = p_store_id and merchant_id = v_issue.merchant_id
    ) then
      raise exception 'la sucursal no pertenece a este comercio' using errcode = '22023';
    end if;
  end if;

  update public.coupon_issues ci
     set status = 'redeemed',
         redeemed_at = now(),
         redeemed_by = v_redeemer,
         redeemed_store_id = p_store_id
   where ci.id = v_issue.id
  returning ci.redeemed_at into v_redeemed;

  insert into public.redemptions (coupon_issue_id, merchant_id, store_id, redeemed_by)
  values (v_issue.id, v_issue.merchant_id, p_store_id, v_redeemer);

  return query select v_issue.id, v_issue.promotion_id, v_issue.merchant_id, v_redeemed;
end;
$$;

revoke all on function public.redeem_coupon(text, uuid) from public, anon;
grant execute on function public.redeem_coupon(text, uuid) to authenticated;

-- Un comercio suspendido deja de poder emitir aunque alguien tenga el UUID.
create or replace function public.issue_coupon(
  p_promotion_id uuid,
  p_token_hash   text,
  p_user_id      uuid,
  p_expires_at   timestamptz default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_promo    public.promotions;
  v_status   text;
  v_issued   integer;
  v_mine     integer;
  v_id       uuid;
begin
  select * into v_promo from public.promotions where id = p_promotion_id for update;
  if v_promo.id is null then
    raise exception 'promoción inexistente' using errcode = 'P0002';
  end if;

  select m.status into v_status from public.merchants m where m.id = v_promo.merchant_id;
  if v_status is distinct from 'active' then
    raise exception 'comercio no disponible' using errcode = 'P0001';
  end if;

  if v_promo.status <> 'published' then
    raise exception 'promoción no publicada' using errcode = 'P0001';
  end if;
  if v_promo.starts_at > now() or (v_promo.ends_at is not null and v_promo.ends_at <= now()) then
    raise exception 'promoción fuera de vigencia' using errcode = 'P0001';
  end if;

  if v_promo.max_redemptions is not null then
    select count(*) into v_issued from public.coupon_issues
     where promotion_id = p_promotion_id and status in ('issued','redeemed');
    if v_issued >= v_promo.max_redemptions then
      raise exception 'promoción agotada' using errcode = 'P0001';
    end if;
  end if;

  if p_user_id is not null then
    select count(*) into v_mine from public.coupon_issues
     where promotion_id = p_promotion_id and user_id = p_user_id and status in ('issued','redeemed');
    if v_mine >= v_promo.max_redemptions_per_user then
      raise exception 'límite por usuario alcanzado' using errcode = 'P0001';
    end if;
  end if;

  insert into public.coupon_issues
    (promotion_id, merchant_id, user_id, token_hash, expires_at)
  values
    (p_promotion_id, v_promo.merchant_id, p_user_id, p_token_hash,
     coalesce(p_expires_at, v_promo.ends_at))
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.issue_coupon(uuid, text, uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.issue_coupon(uuid, text, uuid, timestamptz) to service_role;

-- Columnas públicas: la RLS filtra filas, no columnas. Sin esto `anon` lee
-- max_redemptions, created_at y merchant_id de cualquier promoción publicada.
revoke select on public.merchants from anon;
grant select (id, name, slug, status) on public.merchants to anon;

revoke select on public.promotions from anon;
grant select (id, title, description, discount_type, discount_value, terms, starts_at, ends_at, status)
  on public.promotions to anon;

-- El owner no puede borrar su propia membership: el índice único exige uno,
-- no prohíbe cero. Sin esto el comercio queda huérfano.
drop policy if exists memberships_write_owner on public.memberships;
drop policy if exists memberships_insert_owner on public.memberships;
create policy memberships_insert_owner on public.memberships
  for insert to authenticated
  with check (public.merchant_role(merchant_id) = 'owner');
drop policy if exists memberships_update_owner on public.memberships;
create policy memberships_update_owner on public.memberships
  for update to authenticated
  using (public.merchant_role(merchant_id) = 'owner')
  with check (public.merchant_role(merchant_id) = 'owner');
drop policy if exists memberships_delete_owner on public.memberships;
create policy memberships_delete_owner on public.memberships
  for delete to authenticated
  using (public.merchant_role(merchant_id) = 'owner' and role <> 'owner');

-- Borrar una promoción hace cascade sobre los coupon_issues emitidos y no
-- canjeados. Se permite insertar y actualizar, no borrar.
drop policy if exists promotions_write_manager on public.promotions;
drop policy if exists promotions_insert_manager on public.promotions;
create policy promotions_insert_manager on public.promotions
  for insert to authenticated
  with check (public.can_manage_merchant(merchant_id));
drop policy if exists promotions_update_manager on public.promotions;
create policy promotions_update_manager on public.promotions
  for update to authenticated
  using (public.can_manage_merchant(merchant_id))
  with check (public.can_manage_merchant(merchant_id));