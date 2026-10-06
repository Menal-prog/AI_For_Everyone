'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setError('')
    setSending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { data: { full_name: fullName } },
    })
    setSending(false)
    if (error) {
      if (error.status === 429) {
        setError('Please wait a minute before requesting another code.')
      } else {
        setError(error.message)
      }
    } else {
      setSent(true)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setVerifying(true)
    const supabase = createClient()

    const result = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: 'email',
    })

    setVerifying(false)

    if (result.error) {
      setError('That code did not work. Check the digits or request a new code.')
    } else {
      router.push('/dashboard')
    }
  }

  if (sent) {
    return (
      <main className="max-w-md mx-auto px-8 py-20">
        <h1 className="font-display text-3xl font-bold mb-3">Enter your code</h1>
        <p className="text-slate mb-8">
          We sent an 8-digit code to <strong className="text-ink">{email}</strong>.
          Enter it below. Check your spam folder if you don't see it.
        </p>
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="12345678"
            className="w-full border border-line rounded p-3 text-center text-xl tracking-[0.3em] font-mono bg-white focus:outline-none focus:border-steel"
            maxLength={8}
          />
          <button
            type="submit"
            disabled={verifying}
            className="w-full bg-steel text-white rounded p-3 font-semibold hover:bg-ink transition-colors disabled:opacity-40"
          >
            {verifying ? 'Verifying...' : 'Verify and sign in'}
          </button>
          {error && (
            <p className="text-ochre text-sm border-l-2 border-ochre pl-3">{error}</p>
          )}
        </form>
      </main>
    )
  }

  return (
    <main className="max-w-md mx-auto px-8 py-20">
      <h1 className="font-display text-3xl font-bold mb-3"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-steel inline-block mr-2 -mt-1">
            <circle cx="5" cy="6" r="2" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="19" cy="12" r="2" />
            <line x1="7" y1="6" x2="17" y2="11" />
            <line x1="7" y1="18" x2="17" y2="13" />
          </svg>Sign in</h1>
      <p className="text-slate mb-4">
        Enter your name and email and we'll send you an 8-digit code. No password needed.
      </p>
      <p className="text-sm text-ochre border-l-2 border-ochre pl-3 mb-8">
        Please use a personal email (Gmail, Outlook, Yahoo). University email
        addresses (@uog.edu.pk) do not receive our codes.
      </p>
      <form onSubmit={handleSendCode} className="space-y-4">
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="w-full border border-line rounded p-3 bg-white focus:outline-none focus:border-steel"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
          className="w-full border border-line rounded p-3 bg-white focus:outline-none focus:border-steel"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-steel text-white rounded p-3 font-semibold hover:bg-ink transition-colors disabled:opacity-40"
        >
          {sending ? 'Sending...' : 'Send code'}
        </button>
        {error && (
          <p className="text-ochre text-sm border-l-2 border-ochre pl-3">{error}</p>
        )}
      </form>
    </main>
  )
}