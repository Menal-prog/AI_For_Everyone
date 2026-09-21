import { createClient } from './lib/supabase'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'

async function getWeeks() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const res = await fetch(
    `${supabaseUrl}/rest/v1/weeks?select=*&order=number`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      cache: 'no-store',
    }
  )
  return res.json()
}

export default async function Home() {
  const weeks = await getWeeks()

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">AI for Everyone</h1>
      <p className="text-gray-600 mb-8">
        A twelve-week course. Click a week to see materials and daily tasks.
      </p>
      <div className="space-y-3">
        {weeks.map((week: any) => (
          <Link
            key={week.id}
            href={`/week/${week.id}`}
            className="block border rounded-lg p-4 hover:border-black transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-500">Week {week.number}</span>
                <h2 className="text-lg font-semibold">{week.title}</h2>
              </div>
              <span className="text-sm text-gray-500">
                {week.theory_hours}h theory · {week.practical_hours}h practical
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}