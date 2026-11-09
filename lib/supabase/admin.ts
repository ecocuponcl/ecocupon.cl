import "server-only"
import { createClient } from "@supabase/supabase-js"

/**
 * Cliente con service_role. Salta RLS, así que solo puede usarse en el servidor.
 * El import de "server-only" hace fallar el build si algún componente cliente
 * lo importa, en vez de filtrar la clave al navegador.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.",
    )
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
