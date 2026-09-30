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
      <div className="flex items-center gap-8 mb-10">
        <svg
          viewBox="0 0 160 160"
          className="w-28 h-28 shrink-0"
          aria-hidden="true"
        >
          <g stroke="var(--color-steel)" strokeWidth="1.5" fill="none">
            <line x1="30" y1="40" x2="80" y2="20" />
            <line x1="30" y1="40" x2="60" y2="90" />
            <line x1="80" y1="20" x2="130" y2="55" />
            <line x1="80" y1="20" x2="60" y2="90" />
            <line x1="130" y1="55" x2="60" y2="90" />
            <line x1="60" y1="90" x2="100" y2="130" />
            <line x1="130" y1="55" x2="100" y2="130" />
          </g>
          <circle cx="30" cy="40" r="5" fill="var(--color-steel)" />
          <circle cx="80" cy="20" r="5" fill="var(--color-steel)" />
          <circle cx="130" cy="55" r="5" fill="var(--color-steel)" />
          <circle cx="60" cy="90" r="7" fill="var(--color-ochre)" />
          <circle cx="100" cy="130" r="5" fill="var(--color-steel)" />
        </svg>
        <div>
          <h1 className="font-display text-4xl font-bold mb-2">AI for Everyone</h1>
          <p className="text-slate">
            A twelve-week course. Click a week to see materials and daily tasks.
          </p>
        </div>
      </div>

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