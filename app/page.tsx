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
    <main className="w-full">
      {/* Full-width hero banner */}
      <section
        className="relative w-full flex items-end bg-cover bg-[position:75%_center] md:bg-center min-h-[32rem] md:min-h-[36rem]"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(27,36,48,0.95) 0%, rgba(27,36,48,0.7) 45%, rgba(27,36,48,0.15) 100%)',
          }}
        />
        <div className="relative w-full max-w-5xl mx-auto px-6 md:px-8 pb-12 md:pb-16 text-paper">
          <span className="inline-block text-sm md:text-xs tracking-widest uppercase text-ochre font-semibold mb-4">
            A Twelve-Week Course
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] mb-5">
            AI for Everyone
          </h1>
          <p className="text-paper/90 max-w-xl text-lg md:text-xl leading-relaxed">
            Click a week below to see its materials and daily tasks.
          </p>
        </div>
      </section>

      {/* Weeks */}
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-ink">
            Course weeks
          </h2>
          <span className="text-sm text-slate">{weeks.length} weeks</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {weeks.map((week: any) => (
            <Link
              key={week.id}
              href={`/week/${week.id}`}
              className="group flex flex-col justify-between rounded-xl border border-line bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-steel hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-display text-4xl font-black text-steel">
                    {String(week.number).padStart(2, '0')}
                  </span>
                  <span className="text-ochre text-2xl opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                    →
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-ink leading-snug">
                  {week.title}
                </h3>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-steel/10 text-steel text-xs font-medium px-3 py-1">
                  {week.theory_hours}h theory
                </span>
                <span className="rounded-full bg-ochre/10 text-ochre text-xs font-medium px-3 py-1">
                  {week.practical_hours}h practical
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}