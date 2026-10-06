'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'

export default function DayPage({ params }: { params: Promise<{ id: string }> }) {
  const [dayId, setDayId] = useState<string | null>(null)
  const [day, setDay] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')
  const [mySubmissions, setMySubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => setDayId(id))
  }, [params])

  useEffect(() => {
    if (!dayId) return
    const supabase = createClient()

    async function load() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const res = await fetch(
        `${supabaseUrl}/rest/v1/days?id=eq.${dayId}&select=*`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      )
      const data = await res.json()
      setDay(data[0])

      const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)

      if (userData.user) {
        const { data: subs } = await supabase
          .from('submissions')
          .select('*')
          .eq('day_id', dayId)
          .eq('student_id', userData.user.id)
          .order('submitted_at', { ascending: false })
        setMySubmissions(subs || [])
      }

      setLoading(false)
    }

    load()
  }, [dayId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !user || !dayId) return
    setStatus('Uploading...')

    const supabase = createClient()
    const path = `${user.id}/${dayId}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(path, file)

    if (uploadError) {
      setStatus(`Error: ${uploadError.message}`)
      return
    }

    const { data: inserted, error: insertError } = await supabase
      .from('submissions')
      .insert({
        day_id: dayId,
        student_id: user.id,
        storage_path: path,
      })
      .select()
      .single()

    if (insertError) {
      setStatus(`Error: ${insertError.message}`)
      return
    }

    setStatus('Submitted successfully.')
    setFile(null)
    setMySubmissions((prev) => [inserted, ...prev])
  }

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
    const confirmed = window.confirm('Delete this submission?')
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

    setMySubmissions((prev) => prev.filter((s) => s.id !== submissionId))
  }

  if (loading || !day) {
    return <main className="max-w-3xl mx-auto px-8 py-20">Loading...</main>
  }

  return (
    <main className="max-w-3xl mx-auto px-8 py-12">
      <Link href={`/week/${day.week_id}`} className="text-sm text-slate hover:text-steel">
        Back to week
      </Link>

      <div className="flex items-baseline gap-4 mt-4 mb-8">
        <span className="font-display text-4xl font-bold text-steel">
          {String(day.day_number).padStart(2, '0')}
        </span>
        <h1 className="font-display text-2xl font-bold">{day.title}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-sm font-semibold text-slate mb-2">What you will do</h3>
          <ul className="space-y-1 text-sm">
            {day.activities.map((a: string, i: number) => (
              <li key={i} className="pl-3 border-l border-line">{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate mb-2">What you will learn</h3>
          <ul className="space-y-1 text-sm">
            {day.learning_elements.map((e: string, i: number) => (
              <li key={i} className="pl-3 border-l border-line">{e}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-l-2 border-ochre pl-5 py-2 mb-10">
        <h3 className="font-display font-semibold mb-1">Task for the day</h3>
        <p className="text-sm text-ink">{day.task}</p>
      </div>

      <div className="border border-line rounded p-5">
        <h3 className="font-display font-semibold mb-3">Submit your work</h3>

        {!user && (
          <p className="text-sm text-slate">
            <Link href="/login" className="text-steel hover:underline">
              Sign in
            </Link>{' '}
            to submit your task.
          </p>
        )}

        {user && mySubmissions.length > 0 && (
          <div className="space-y-2 mb-4">
            {mySubmissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 text-sm border-l-2 border-steel pl-3 py-1"
              >
                <span className="text-slate">
                  Submitted {new Date(s.submitted_at).toLocaleString()}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenFile(s.storage_path, s.id)}
                    disabled={openingId === s.id}
                    className="text-xs bg-steel text-white rounded px-2 py-1 font-semibold hover:bg-ink transition-colors disabled:opacity-40"
                  >
                    {openingId === s.id ? 'Opening...' : 'Open'}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="text-xs border border-line rounded px-2 py-1 font-semibold hover:border-ochre hover:text-ochre transition-colors disabled:opacity-40"
                  >
                    {deletingId === s.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {user && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="file"
              key={mySubmissions.length}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <button
              type="submit"
              disabled={!file}
              className="bg-ochre text-white rounded px-4 py-2 text-sm font-semibold hover:bg-ink transition-colors disabled:opacity-40"
            >
              {mySubmissions.length > 0 ? 'Submit another file' : 'Submit'}
            </button>
            {status && <p className="text-sm text-slate">{status}</p>}
          </form>
        )}
      </div>
    </main>
  )
}