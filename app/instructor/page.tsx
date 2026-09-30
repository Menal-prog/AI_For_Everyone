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
    return <main className="max-w-4xl mx-auto p-8">Loading...</main>
  }

  if (!user) {
    return (
      <main className="max-w-4xl mx-auto p-8 text-center mt-20">
        <h1 className="text-2xl font-bold mb-4">Not signed in</h1>
        <Link href="/login" className="text-blue-600 hover:underline">
          Go to login
        </Link>
      </main>
    )
  }

  if (profile?.role !== 'instructor') {
    return (
      <main className="max-w-4xl mx-auto p-8 text-center mt-20">
        <h1 className="text-2xl font-bold mb-4">Instructors only</h1>
        <p className="text-gray-600">This page is restricted.</p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">All submissions</h1>

      {submissions.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s: any) => (
            <div key={s.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-semibold">
                    {s.profiles?.full_name || 'Unnamed'}
                  </h3>
                  <p className="text-sm text-gray-500">{s.days?.title}</p>
                  <p className="text-xs text-gray-400">
                    Submitted {new Date(s.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenFile(s.storage_path, s.id)}
                  disabled={openingId === s.id}
                  className="bg-black text-white rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40 whitespace-nowrap"
                >
                  {openingId === s.id ? 'Opening...' : 'Open file'}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Grade</label>
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
                    className="border rounded-lg p-2 text-sm w-28"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-gray-500 mb-1">Feedback</label>
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
                    className="border rounded-lg p-2 text-sm w-full"
                  />
                </div>
                <button
                  onClick={() => handleSaveGrade(s.id)}
                  disabled={savingId === s.id}
                  className="border rounded-lg px-3 py-2 text-sm font-semibold hover:bg-gray-100 disabled:opacity-40"
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