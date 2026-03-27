import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase Server Client
 * IMPORTANT: Always create a new client instance per request.
 * Never store in global variables (especially with Fluid compute).
 * Keys are managed via Supabase Vault - never hardcode.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Supabase server-client initialized without valid URL/Key.')
    } else {
      console.warn('Supabase local: No valid credentials (using fallback data)')
    }
    return null as any
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Expected when called from Server Component
          // Middleware handles session refresh
        }
      },
    },
  })
}
