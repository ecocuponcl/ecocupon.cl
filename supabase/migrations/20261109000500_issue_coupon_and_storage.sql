-- Emisión atómica: valida vigencia, tope global y tope por usuario antes de insertar.
-- El token en claro nunca llega aquí; solo su hash y un lookup público.

create or replace function public.issue_coupon(
  p_promotion_id uuid,
  p_token_hash   text,
  p_user_id      uuid,
  p_expires_at   timestamptz default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_promo    public.promotions;
  v_issued   integer;
  v_mine     integer;
  v_id       uuid;
begin
  select * into v_promo from public.promotions where id = p_promotion_id for update;
  if v_promo.id is null then
    raise exception 'promoción inexistente' using errcode = 'P0002';
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

-- Storage: el bucket es público para lectura, pero la escritura exige sesión y
-- queda acotada al prefijo del propio usuario (<uid>/...), no al bucket entero.
drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "product images owner write" on storage.objects;
create policy "product images owner write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "product images owner delete" on storage.objects;
create policy "product images owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
