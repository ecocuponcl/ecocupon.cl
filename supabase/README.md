# Migraciones

Versionadas y **no destructivas**: todas usan `create table if not exists`,
`add column if not exists` y `drop policy if exists` + `create policy`.
Ninguna hace `DROP TABLE` ni `DELETE`. Se pueden aplicar sobre la base actual
sin perder las 29 filas existentes de `categories`, `products` y `knasta_prices`.

## Estado

**NO APLICADAS.** No hay acceso administrativo al proyecto `uyxvzztnsvfcqmgkrnol`:
la clave `service_role` disponible otorga REST (PostgREST), no DDL.
Ver `docs/ECOCUPON-TECHNICAL-AUDIT.md` para las vías de acceso.

## Orden

| Archivo | Contenido |
|---|---|
| `20261109000100_tenancy.sql` | `merchants`, `stores`, `memberships`, helpers de rol y `touch_updated_at` |
| `20261109000200_promotions_coupons.sql` | `promotions`, `coupon_issues`, `redemptions`, triggers de inmutabilidad, `redeem_coupon` |
| `20261109000300_rls_policies.sql` | RLS con aislamiento por comercio, `create_merchant_with_owner` |
| `20261109000400_legacy_restore.sql` | `profiles`, `recycling_events`, `plate_detection_logs`, `upload_tracking`, `products.plate` |
| `20261109000500_issue_coupon_and_storage.sql` | `issue_coupon` y políticas de `storage.objects` |

## Cómo aplicarlas

Con la CLI de Supabase (requiere login interactivo, que solo puede hacer el dueño):

```sh
supabase link --project-ref uyxvzztnsvfcqmgkrnol
supabase db push
```

O pegando cada archivo en el SQL Editor del dashboard, en el orden de la tabla.

## Decisiones de diseño

- **El token de cupón nunca se guarda en claro.** Se persiste `sha256` en
  `coupon_issues.token_hash` más un `token_lookup` público no reversible para
  poder buscar sin exponer el token.
- **El canje es un `UPDATE` condicional** sobre `status = 'issued'` dentro de
  `redeem_coupon`. Si dos cajas validan a la vez, solo una afecta una fila.
  `redemptions.coupon_issue_id` es `UNIQUE` como segunda barrera.
- **`redemptions` es append-only** por trigger: no admite `UPDATE` ni `DELETE`.
- **La emisión es `service_role` únicamente.** `coupon_issues` no tiene política
  de `INSERT`, así que el navegador no puede fabricar cupones aunque quisiera.
- **Un comercio no puede quedar sin dueño:** el índice único parcial sobre
  `memberships(merchant_id) where role = 'owner'` lo impide, y el alta pasa por
  `create_merchant_with_owner` en una sola transacción.
