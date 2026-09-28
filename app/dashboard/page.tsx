'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openingId, setOpeningId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        loadSubmissions(data.user.id)
      } else {
        setLoading(false)
      }
    })

    async function loadSubmissions(userId: string) {
      const { data } = await supabase
        .from('submissions')
        .select('*, days(title, day_number, week_id)')
        .eq('student_id', userId)
        .order('submitted_at', { ascending: false })
      setSubmissions(data || [])
      setLoading(false)
    }
  }, [])

  async function handleOpenFile(storagePath: string, submissionId: string) {
    setOpeningId(submissionId)
    const supabase = createClient()

    const { data, error } = await supabase.storage
      .from('submissions')
      .createSignedUrl(storagePath, 60)

    setOpeningId(null)

    if (error || !data) {
      alert('Could not open file: ' + (error?.message || 'unknown error'))
      return
    }

    window.open(data.signedUrl, '_blank')
  }

  if (loading) {
    return <main className="max-w-3xl mx-auto p-8">Loading...</main>
  }

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto p-8 text-center mt-20">
        <h1 className="text-2xl font-bold mb-4">Not signed in</h1>
        <Link href="/login" className="text-blue-600 hover:underline">
          Go to login
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">My submissions</h1>
      <p className="text-gray-600 mb-6">Signed in as {user.email}</p>

      {submissions.length === 0 ? (
        <p className="text-gray-500">
          You haven't submitted anything yet. Go to a day's task page to submit your work.
        </p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s: any) => (
            <div key={s.id} className="border rounded-lg p-4">
              <h3 className="font-semibold">{s.days?.title}</h3>
              <p className="text-sm text-gray-500">
                Submitted {new Date(s.submitted_at).toLocaleDateString()}
              </p>
              {s.grade && <p className="text-sm mt-1">Grade: {s.grade}</p>}
              {s.feedback && <p className="text-sm mt-1">Feedback: {s.feedback}</p>}
              <button
                onClick={() => handleOpenFile(s.storage_path, s.id)}
                disabled={openingId === s.id}
                className="mt-3 text-sm bg-black text-white rounded-lg px-3 py-1.5 font-semibold disabled:opacity-40"
              >
                {openingId === s.id ? 'Opening...' : 'Open file'}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}