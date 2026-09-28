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
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Student</th>
              <th className="py-2 pr-4">Task</th>
              <th className="py-2 pr-4">Submitted</th>
              <th className="py-2 pr-4">Grade</th>
              <th className="py-2 pr-4">File</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s: any) => (
              <tr key={s.id} className="border-b">
                <td className="py-2 pr-4">{s.profiles?.full_name || 'Unnamed'}</td>
                <td className="py-2 pr-4">{s.days?.title}</td>
                <td className="py-2 pr-4">
                  {new Date(s.submitted_at).toLocaleDateString()}
                </td>
                <td className="py-2 pr-4">{s.grade || '—'}</td>
                <td className="py-2 pr-4">
                  <button
                    onClick={() => handleOpenFile(s.storage_path, s.id)}
                    disabled={openingId === s.id}
                    className="bg-black text-white rounded-lg px-3 py-1 text-xs font-semibold disabled:opacity-40"
                  >
                    {openingId === s.id ? 'Opening...' : 'Open file'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}