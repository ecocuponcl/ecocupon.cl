-- P1: aislamiento entre comercios. Sin estas políticas, RLS activo bloquea todo
-- (deny by default), que es el estado seguro si algo queda a medias.

alter table public.merchants      enable row level security;
alter table public.stores         enable row level security;
alter table public.memberships    enable row level security;
alter table public.promotions     enable row level security;
alter table public.coupon_issues  enable row level security;
alter table public.redemptions    enable row level security;

-- merchants
drop policy if exists merchants_select_member on public.merchants;
create policy merchants_select_member on public.merchants
  for select to authenticated using (public.is_merchant_member(id));

drop policy if exists merchants_update_manager on public.merchants;
create policy merchants_update_manager on public.merchants
  for update to authenticated
  using (public.can_manage_merchant(id)) with check (public.can_manage_merchant(id));

-- El alta de comercio va por función: crear el merchant y su membership owner
-- en una sola transacción, para que nunca exista un comercio sin dueño.
create or replace function public.create_merchant_with_owner(p_name text, p_slug text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'se requiere sesión' using errcode = '42501';
  end if;
  insert into public.merchants (name, slug) values (trim(p_name), lower(trim(p_slug)))
  returning id into v_id;
  insert into public.memberships (merchant_id, user_id, role)
  values (v_id, auth.uid(), 'owner');
  return v_id;
end;
$$;
revoke all on function public.create_merchant_with_owner(text, text) from public, anon;
grant execute on function public.create_merchant_with_owner(text, text) to authenticated;

-- stores
drop policy if exists stores_select_member on public.stores;
create policy stores_select_member on public.stores
  for select to authenticated using (public.is_merchant_member(merchant_id));

drop policy if exists stores_write_manager on public.stores;
create policy stores_write_manager on public.stores
  for all to authenticated
  using (public.can_manage_merchant(merchant_id))
  with check (public.can_manage_merchant(merchant_id));

-- memberships: cada quien ve las de sus comercios; solo el owner reparte roles.
drop policy if exists memberships_select_member on public.memberships;
create policy memberships_select_member on public.memberships
  for select to authenticated using (public.is_merchant_member(merchant_id));

drop policy if exists memberships_write_owner on public.memberships;
create policy memberships_write_owner on public.memberships
  for all to authenticated
  using (public.merchant_role(merchant_id) = 'owner')
  with check (public.merchant_role(merchant_id) = 'owner');

-- promotions: lectura pública solo de las publicadas y vigentes (marketplace);
-- los miembros ven todo lo suyo. Escritura solo owner/manager.
drop policy if exists promotions_select_public on public.promotions;
create policy promotions_select_public on public.promotions
  for select to anon, authenticated
  using (
    status = 'published'
    and starts_at <= now()
    and (ends_at is null or ends_at > now())
  );

drop policy if exists promotions_select_member on public.promotions;
create policy promotions_select_member on public.promotions
  for select to authenticated using (public.is_merchant_member(merchant_id));

drop policy if exists promotions_write_manager on public.promotions;
create policy promotions_write_manager on public.promotions
  for all to authenticated
  using (public.can_manage_merchant(merchant_id))
  with check (public.can_manage_merchant(merchant_id));

-- coupon_issues: sin política de INSERT. La emisión ocurre en el servidor con
-- service_role; el navegador nunca escribe un cupón. Cada quien ve los suyos,
-- y el comercio ve los emitidos sobre sus promociones.
drop policy if exists coupon_issues_select_own on public.coupon_issues;
create policy coupon_issues_select_own on public.coupon_issues
  for select to authenticated
  using (user_id = auth.uid() or public.is_merchant_member(merchant_id));

-- redemptions: solo el comercio. El consumidor no necesita leer el libro de canjes.
drop policy if exists redemptions_select_member on public.redemptions;
create policy redemptions_select_member on public.redemptions
  for select to authenticated using (public.is_merchant_member(merchant_id));
