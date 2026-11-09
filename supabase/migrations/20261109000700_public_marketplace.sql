-- El marketplace público necesita mostrar el nombre del comercio junto a la
-- promoción. Sin esta política, la lectura anónima de `merchants` devuelve vacío
-- y el consumidor ve ofertas sin saber de quién son.

drop policy if exists merchants_select_public_active on public.merchants;
create policy merchants_select_public_active on public.merchants
  for select to anon, authenticated
  using (status = 'active');

-- Vista de descubrimiento: solo lo publicable, sin exponer columnas internas.
create or replace view public.marketplace_promotions
with (security_invoker = true) as
select
  p.id,
  p.title,
  p.description,
  p.discount_type,
  p.discount_value,
  p.terms,
  p.ends_at,
  m.name  as merchant_name,
  m.slug  as merchant_slug,
  p.starts_at
from public.promotions p
join public.merchants m on m.id = p.merchant_id
where p.status = 'published'
  and m.status = 'active'
  and p.starts_at <= now()
  and (p.ends_at is null or p.ends_at > now());

grant select on public.marketplace_promotions to anon, authenticated;