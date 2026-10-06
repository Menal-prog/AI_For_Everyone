import Link from 'next/link'

async function getWeekData(id: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  }

  const weekRes = await fetch(
    `${supabaseUrl}/rest/v1/weeks?id=eq.${id}&select=*`,
    { headers, cache: 'no-store' }
  )
  const weekData = await weekRes.json()
  const week = weekData[0]

  const daysRes = await fetch(
    `${supabaseUrl}/rest/v1/days?week_id=eq.${id}&select=*&order=day_number`,
    { headers, cache: 'no-store' }
  )
  const days = await daysRes.json()

  const materialsRes = await fetch(
    `${supabaseUrl}/rest/v1/materials?week_id=eq.${id}&select=*`,
    { headers, cache: 'no-store' }
  )
  const materials = await materialsRes.json()

  return { week, days, materials }
}

export default async function WeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { week, days, materials } = await getWeekData(id)

  if (!week) {
    return <main className="max-w-3xl mx-auto px-8 py-20">Week not found.</main>
  }

  return (
    <main className="max-w-3xl mx-auto px-8 py-12">
      <Link href="/" className="text-sm text-slate hover:text-steel">
        Back to all weeks
      </Link>

      <div className="flex items-baseline gap-4 mt-4 mb-1">
        <span className="font-display text-4xl font-bold text-steel">
          {String(week.number).padStart(2, '0')}
        </span>
        <h1 className="font-display text-2xl font-bold">{week.title}</h1>
      </div>
      <p className="text-slate mb-8">
        {week.theory_hours}h theory, {week.practical_hours}h practical
      </p>

      <div className="border-l-2 border-line pl-5 py-1 mb-10">
        <h3 className="font-display font-semibold mb-2 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-steel">
            <circle cx="5" cy="6" r="2" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="19" cy="12" r="2" />
            <line x1="7" y1="6" x2="17" y2="11" />
            <line x1="7" y1="18" x2="17" y2="13" />
          </svg>
          Materials
        </h3>
        {materials.length === 0 && (
          <p className="text-sm text-slate">Not posted yet, check back after class.</p>
        )}
        {materials.length > 0 && (
          <ul className="space-y-1">
            {materials.map((m: any) => (
              <li key={m.id}>
                <a
                  href={m.storage_path}
                  target="_blank"
                  className="text-steel hover:underline text-sm"
                >
                  {m.file_name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-1">
        {days.map((day: any) => (
          <Link
            key={day.id}
            href={`/day/${day.id}`}
            className="flex items-baseline gap-5 py-4 border-t border-line hover:border-steel transition-colors group"
          >
            <span className="font-display text-xl font-bold text-steel w-8 shrink-0">
              {String(day.day_number).padStart(2, '0')}
            </span>
            <h3 className="font-display font-semibold group-hover:text-steel transition-colors">
              {day.title}
            </h3>
          </Link>
        ))}
      </div>
    </main>
  )
}