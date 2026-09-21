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
  const [mySubmission, setMySubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
        const { data: sub } = await supabase
          .from('submissions')
          .select('*')
          .eq('day_id', dayId)
          .eq('student_id', userData.user.id)
          .maybeSingle()
        setMySubmission(sub)
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
    const path = `${user.id}/${dayId}/${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setStatus(`Error: ${uploadError.message}`)
      return
    }

    const { error: insertError } = await supabase.from('submissions').insert({
      day_id: dayId,
      student_id: user.id,
      storage_path: path,
    })

    if (insertError) {
      setStatus(`Error: ${insertError.message}`)
      return
    }

    setStatus('Submitted successfully.')
    setMySubmission({ storage_path: path, submitted_at: new Date().toISOString() })
  }

  if (loading || !day) {
    return <main className="max-w-3xl mx-auto p-8">Loading...</main>
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link href={`/week/${day.week_id}`} className="text-sm text-gray-500 hover:underline">
        Back to week
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">
        Day {day.day_number} - {day.title}
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-semibold text-sm text-gray-500 mb-2">What you will do</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {day.activities.map((a: string, i: number) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-500 mb-2">What you will learn</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {day.learning_elements.map((e: string, i: number) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded mb-8">
        <h3 className="font-semibold text-orange-800 mb-1">Task for the day</h3>
        <p className="text-sm">{day.task}</p>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Submit your work</h3>

        {!user && (
          <p className="text-sm text-gray-600">
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>{' '}
            to submit your task.
          </p>
        )}

        {user && mySubmission && (
          <p className="text-sm text-green-700">
            Already submitted on {new Date(mySubmission.submitted_at).toLocaleDateString()}.
            Uploading again will replace it.
          </p>
        )}

        {user && (
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <button
              type="submit"
              disabled={!file}
              className="bg-black text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Submit
            </button>
            {status && <p className="text-sm">{status}</p>}
          </form>
        )}
      </div>
    </main>
  )
}