-- 20261109000200 revocó issue_coupon de public/anon/authenticated para que solo
-- el servidor pueda emitir, pero no concedió EXECUTE a service_role. PostgREST
-- expone las funciones según los privilegios del rol, así que sin esta concesión
-- el RPC no aparece en el esquema y la emisión falla con "function not found".

grant execute on function public.issue_coupon(uuid, text, uuid, timestamptz) to service_role;

-- redeem_coupon ya está concedido a authenticated en la migración anterior;
-- se reafirma para que el estado sea explícito y reproducible.
grant execute on function public.redeem_coupon(text, uuid) to authenticated;

-- Helpers de RLS: las políticas los invocan, así que los roles que evalúan
-- políticas necesitan poder ejecutarlos.
grant execute on function public.is_merchant_member(uuid) to authenticated, anon;
grant execute on function public.merchant_role(uuid) to authenticated;
grant execute on function public.can_manage_merchant(uuid) to authenticated;
grant execute on function public.create_merchant_with_owner(text, text) to authenticated;