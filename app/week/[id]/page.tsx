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
    return <main className="max-w-3xl mx-auto p-8">Week not found.</main>
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <Link href="/" className="text-sm text-gray-500 hover:underline">
        Back to all weeks
      </Link>

      <h1 className="text-2xl font-bold mt-4">
        Week {week.number} - {week.title}
      </h1>
      <p className="text-gray-600 mb-6">
        {week.theory_hours}h theory, {week.practical_hours}h practical
      </p>

      <div className="border rounded-lg p-4 mb-8 bg-gray-50">
        <h3 className="font-semibold mb-2">Materials</h3>
        {materials.length === 0 && (
          <p className="text-sm text-gray-500">Not posted yet, check back after class.</p>
        )}
        {materials.length > 0 && (
          <ul className="space-y-1">
            {materials.map((m: any) => (
              <li key={m.id}>
                <a href={m.storage_path} target="_blank" className="text-blue-600 hover:underline text-sm">
                  {m.file_name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        {days.map((day: any) => (
          <Link key={day.id} href={`/day/${day.id}`} className="block border rounded-lg p-4 hover:border-black transition">
            <span className="text-sm text-gray-500">Day {day.day_number}</span>
            <h3 className="font-semibold">{day.title}</h3>
          </Link>
        ))}
      </div>
    </main>
  )
}