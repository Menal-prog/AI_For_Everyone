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
    <nav className="border-b border-line">
      <div className="max-w-3xl mx-auto px-8 py-4 flex items-center gap-8 text-sm">
        <Link href="/" className="font-display font-bold text-lg text-ink">
          AI for Everyone
        </Link>
        <Link href="/dashboard" className="text-slate hover:text-steel">
          My submissions
        </Link>
        <Link href="/instructor" className="text-slate hover:text-steel">
          Instructor
        </Link>

        <div className="ml-auto">
          {!loading && !user && (
            <Link href="/login" className="text-steel font-semibold">
              Sign in
            </Link>
          )}
          {!loading && user && (
            <button
              onClick={handleSignOut}
              className="text-slate hover:text-steel font-semibold"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}