'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

export default function NavBar() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  return (
    <nav className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-4 flex flex-wrap items-center justify-between gap-y-3 text-base">
        <Link
          href="/"
          className="order-1 font-display font-bold text-xl md:text-lg text-ink whitespace-nowrap"
        >
          AI for Everyone
        </Link>

        <div className="order-3 w-full flex items-center gap-8 md:order-2 md:w-auto md:flex-1 md:ml-10 md:gap-6 md:text-sm">
          <Link
            href="/dashboard"
            className="text-slate hover:text-steel whitespace-nowrap py-1"
          >
            My submissions
          </Link>
          <Link
            href="/instructor"
            className="text-slate hover:text-steel whitespace-nowrap py-1"
          >
            Instructor
          </Link>
        </div>

        <div className="order-2 md:order-3">
          {!loading && !user && (
            <Link
              href="/login"
              className="text-steel font-semibold whitespace-nowrap rounded-full border border-steel px-5 py-2 md:px-4 md:py-1.5 md:text-sm hover:bg-steel hover:text-paper transition-colors"
            >
              Sign in
            </Link>
          )}
          {!loading && user && (
            <button
              onClick={handleSignOut}
              className="text-slate hover:text-steel font-semibold whitespace-nowrap rounded-full border border-line px-5 py-2 md:px-4 md:py-1.5 md:text-sm hover:border-steel transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}