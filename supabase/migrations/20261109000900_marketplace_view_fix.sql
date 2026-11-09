-- Bug de producción: `marketplace_promotions` se creó con security_invoker, así
-- que el JOIN evaluaba los privilegios de columna de `anon`. El JOIN necesita
-- p.merchant_id, que no está entre las columnas publicables, y la consulta del
-- marketplace fallaba con 42501 "permission denied for table promotions".
--
-- La vista pasa a ser definer (se ejecuta con los privilegios de su dueño), así
-- que `anon` solo necesita SELECT sobre la vista y pierde todo acceso directo a
-- las tablas base. Es más estricto que antes, no menos: la vista es la única
-- superficie pública y su WHERE define exactamente lo expuesto.

drop view if exists public.marketplace_promotions;

create view public.marketplace_promotions as
select
  p.id,
  p.title,
  p.description,
  p.discount_type,
  p.discount_value,
  p.terms,
  p.ends_at,
  m.name as merchant_name,
  m.slug as merchant_slug,
  p.starts_at
from public.promotions p
join public.merchants m on m.id = p.merchant_id
where p.status = 'published'
  and m.status = 'active'
  and p.starts_at <= now()
  and (p.ends_at is null or p.ends_at > now());

revoke all on public.marketplace_promotions from anon, authenticated;
grant select on public.marketplace_promotions to anon, authenticated;

-- `anon` ya no lee las tablas base ni por columna: todo el descubrimiento pasa
-- por la vista. Si mañana se agrega una columna a promotions, no nace pública.
revoke select on public.promotions from anon;
revoke select on public.merchants from anon;