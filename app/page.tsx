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
      <div
        className="relative rounded-lg overflow-hidden mb-12 h-72 md:h-80 flex items-end bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(27,36,48,0.92) 0%, rgba(27,36,48,0.55) 50%, rgba(27,36,48,0.15) 100%)',
          }}
        />
        <div className="relative p-8 text-paper">
          <span className="inline-block text-xs tracking-widest uppercase text-ochre font-semibold mb-3">
            A Twelve-Week Course
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">
            AI for Everyone
          </h1>
          <p className="text-paper/80 max-w-md">
            Click a week below to see its materials and daily tasks.
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