"use client"

import Link from "next/link"
import { ShoppingBag, User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import type { User as SupabaseUser, UserResponse, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const categories = [
  { name: "Tecnología", slug: "technology" },
  { name: "Moda", slug: "fashion" },
  { name: "Hogar", slug: "home" },
  { name: "Ofertas", slug: "all" },
]

export function SiteHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Manejo de scroll para efecto glassmorphism
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    
    // Auth state management
    const supabase = createClient()
    supabase.auth.getUser().then((response: UserResponse) => setUser(response.data.user))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  return (
    <header className={`glass-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header">
        {/* Logo Section */}
        <Link href="/" className="logo">
          <ShoppingBag size={24} color="var(--primary)" />
          <span>EcoCupon</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="nav-link">
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="user-actions">
          {user ? (
            <div className="user-menu" tabIndex={0}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} />
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{user.email?.split("@")[0]}</span>
              </div>
              
              <div className="user-dropdown">
                <div style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
                  {user.email}
                </div>
                <button onClick={handleSignOut} className="dropdown-item danger">
                  <LogOut size={16} />
                  Salir
                </button>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="btn btn-primary">
              <User size={16} style={{ marginRight: '8px' }} />
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
