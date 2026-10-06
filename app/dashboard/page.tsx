'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(true)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

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

      const { count } = await supabase
        .from('days')
        .select('*, weeks!inner(number)', { count: 'exact', head: true })
        .gt('weeks.number', 3)
      setTotalDays(count || 0)

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

  async function handleDelete(submissionId: string) {
    const confirmed = window.confirm(
      'Delete this submission? You can upload a new file for this day afterward.'
    )
    if (!confirmed) return

    setDeletingId(submissionId)
    const supabase = createClient()

    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId)

    setDeletingId(null)

    if (error) {
      alert('Could not delete: ' + error.message)
      return
    }

    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId))
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <main className="max-w-3xl mx-auto px-8 py-20">Loading...</main>
  }

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto px-8 py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Not signed in</h1>
        <Link href="/login" className="text-steel hover:underline">
          Go to login
        </Link>
      </main>
    )
  }

  const percent = totalDays > 0 ? Math.round((submissions.length / totalDays) * 100) : 0

  return (
    <main className="max-w-3xl mx-auto px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-sm text-slate hover:text-steel">
          Back to course
        </Link>
        <button
          onClick={handleSignOut}
          className="text-sm border border-line rounded px-3 py-1.5 font-semibold hover:border-steel hover:text-steel transition-colors"
        >
          Sign out
        </button>
      </div>

      <h1 className="font-display text-3xl font-bold mb-1"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-steel inline-block mr-2 -mt-1">
            <circle cx="5" cy="6" r="2" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="19" cy="12" r="2" />
            <line x1="7" y1="6" x2="17" y2="11" />
            <line x1="7" y1="18" x2="17" y2="13" />
          </svg>My submissions</h1>
      <p className="text-slate mb-6">Signed in as {user.email}</p>

      {totalDays > 0 && (
        <div className="mb-10">
          <div className="flex justify-between text-sm text-slate mb-1">
            <span>Progress</span>
            <span>
              {submissions.length} of {totalDays} days submitted
            </span>
          </div>
          <div className="h-2 bg-line rounded-full overflow-hidden">
            <div
              className="h-full bg-ochre rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {submissions.length === 0 ? (
        <p className="text-slate">
          You haven't submitted anything yet. Go to a day's task page to submit your work.
        </p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s: any) => (
            <div key={s.id} className="border-l-2 border-steel pl-5 py-1">
              <h3 className="font-display text-lg font-semibold">{s.days?.title}</h3>
              <p className="text-sm text-slate">
                Submitted {new Date(s.submitted_at).toLocaleDateString()}
              </p>
              {s.grade && (
                <p className="text-sm mt-2">
                  <span className="text-slate">Grade: </span>
                  <span className="text-ochre font-semibold">{s.grade}</span>
                </p>
              )}
              {s.feedback && (
                <p className="text-sm mt-1 text-slate">{s.feedback}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleOpenFile(s.storage_path, s.id)}
                  disabled={openingId === s.id}
                  className="text-sm bg-steel text-white rounded px-3 py-1.5 font-semibold hover:bg-ink transition-colors disabled:opacity-40"
                >
                  {openingId === s.id ? 'Opening...' : 'Open file'}
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="text-sm border border-line rounded px-3 py-1.5 font-semibold hover:border-ochre hover:text-ochre transition-colors disabled:opacity-40"
                >
                  {deletingId === s.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}