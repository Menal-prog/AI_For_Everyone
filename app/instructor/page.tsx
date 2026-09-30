'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../lib/supabase'

export default function InstructorPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, { grade: string; feedback: string }>>({})

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)

      if (!userData.user) {
        setLoading(false)
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()
      setProfile(profileData)

      if (profileData?.role === 'instructor') {
        const { data: subs } = await supabase
          .from('submissions')
          .select('*, days(title, day_number), profiles(full_name)')
          .order('submitted_at', { ascending: false })
        setSubmissions(subs || [])

        const initialDrafts: Record<string, { grade: string; feedback: string }> = {}
        for (const s of subs || []) {
          initialDrafts[s.id] = {
            grade: s.grade || '',
            feedback: s.feedback || '',
          }
        }
        setDrafts(initialDrafts)
      }

      setLoading(false)
    }

    load()
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

  async function handleSaveGrade(submissionId: string) {
    setSavingId(submissionId)
    const supabase = createClient()
    const draft = drafts[submissionId]

    const { error } = await supabase
      .from('submissions')
      .update({ grade: draft.grade, feedback: draft.feedback })
      .eq('id', submissionId)

    setSavingId(null)

    if (error) {
      alert('Could not save: ' + error.message)
      return
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId ? { ...s, grade: draft.grade, feedback: draft.feedback } : s
      )
    )
  }

  if (loading) {
    return <main className="max-w-4xl mx-auto px-8 py-20">Loading...</main>
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto px-8 py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Not signed in</h1>
        <Link href="/login" className="text-steel hover:underline">
          Go to login
        </Link>
      </main>
    )
  }

  if (profile?.role !== 'instructor') {
    return (
      <main className="max-w-4xl mx-auto px-8 py-20 text-center">
        <h1 className="font-display text-3xl font-bold mb-4">Instructors only</h1>
        <p className="text-slate">This page is restricted.</p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="font-display text-3xl font-bold mb-8">All submissions</h1>

      {submissions.length === 0 ? (
        <p className="text-slate">No submissions yet.</p>
      ) : (
        <div className="space-y-5">
          {submissions.map((s: any) => (
            <div key={s.id} className="border-l-2 border-steel pl-5 py-2">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    {s.profiles?.full_name || 'Unnamed'}
                  </h3>
                  <p className="text-sm text-slate">{s.days?.title}</p>
                  <p className="text-xs text-slate">
                    Submitted {new Date(s.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenFile(s.storage_path, s.id)}
                  disabled={openingId === s.id}
                  className="bg-steel text-white rounded px-3 py-1.5 text-xs font-semibold hover:bg-ink transition-colors disabled:opacity-40 whitespace-nowrap"
                >
                  {openingId === s.id ? 'Opening...' : 'Open file'}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs text-slate mb-1">Grade</label>
                  <input
                    type="text"
                    value={drafts[s.id]?.grade || ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [s.id]: { ...prev[s.id], grade: e.target.value },
                      }))
                    }
                    placeholder="e.g. A or 9/10"
                    className="border border-line rounded p-2 text-sm w-28 bg-white focus:outline-none focus:border-steel"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-slate mb-1">Feedback</label>
                  <input
                    type="text"
                    value={drafts[s.id]?.feedback || ''}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [s.id]: { ...prev[s.id], feedback: e.target.value },
                      }))
                    }
                    placeholder="Optional comment for the student"
                    className="border border-line rounded p-2 text-sm w-full bg-white focus:outline-none focus:border-steel"
                  />
                </div>
                <button
                  onClick={() => handleSaveGrade(s.id)}
                  disabled={savingId === s.id}
                  className="border border-line rounded px-3 py-2 text-sm font-semibold hover:border-steel hover:text-steel transition-colors disabled:opacity-40"
                >
                  {savingId === s.id ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}