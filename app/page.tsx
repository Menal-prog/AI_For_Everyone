import Link from 'next/link'

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
    <main className="max-w-3xl mx-auto px-8 py-12">
      <h1 className="font-display text-4xl font-bold mb-3">AI for Everyone</h1>
      <p className="text-slate mb-10">
        A twelve-week course. Click a week to see materials and daily tasks.
      </p>
      <div className="space-y-1">
        {weeks.map((week: any) => (
          <Link
            key={week.id}
            href={`/week/${week.id}`}
            className="flex items-baseline gap-5 py-4 border-t border-line hover:border-steel transition-colors group"
          >
            <span className="font-display text-2xl font-bold text-steel w-10 shrink-0">
              {String(week.number).padStart(2, '0')}
            </span>
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold group-hover:text-steel transition-colors">
                {week.title}
              </h2>
            </div>
            <span className="text-sm text-slate shrink-0">
              {week.theory_hours}h theory · {week.practical_hours}h practical
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}