'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const router = useRouter()

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { data: { full_name: fullName } },
    })
    if (error) {
      setError(JSON.stringify(error, null, 2))
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
      token: code,
      type: 'email',
    })

    setVerifying(false)

    if (result.error) {
      setError(JSON.stringify(result.error, null, 2))
    } else {
      router.push('/dashboard')
    }
  }

  if (sent) {
    return (
      <main className="max-w-md mx-auto p-8 mt-20">
        <h1 className="text-2xl font-bold mb-2">Enter your code</h1>
        <p className="text-gray-600 mb-6">
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
        </p>
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="12345678"
            className="w-full border rounded-lg p-3 text-center text-xl tracking-widest"
            maxLength={8}
          />
          <button
            type="submit"
            disabled={verifying}
            className="w-full bg-black text-white rounded-lg p-3 font-semibold disabled:opacity-40"
          >
            {verifying ? 'Verifying...' : 'Verify and sign in'}
          </button>
          {error && (
            <pre className="text-red-600 text-xs whitespace-pre-wrap bg-red-50 p-3 rounded">
              {error}
            </pre>
          )}
        </form>
      </main>
    )
  }

  return (
    <main className="max-w-md mx-auto p-8 mt-20">
      <h1 className="text-2xl font-bold mb-2">Sign in</h1>
      <p className="text-gray-600 mb-6">
        Enter your name and email and we'll send you a 6-digit code. No password needed.
      </p>
      <form onSubmit={handleSendCode} className="space-y-4">
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className="w-full border rounded-lg p-3"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border rounded-lg p-3"
        />
        <button
          type="submit"
          className="w-full bg-black text-white rounded-lg p-3 font-semibold"
        >
          Send code
        </button>
        {error && (
          <pre className="text-red-600 text-xs whitespace-pre-wrap bg-red-50 p-3 rounded">
            {error}
          </pre>
        )}
      </form>
    </main>
  )
}