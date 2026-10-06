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

const LAYER_X = [70, 230, 390, 550, 710]
const LAYER_NODES = [3, 4, 5, 4, 2]
const LAYER_Y_SPAN = 220
const LAYER_Y_START = 30

function nodeY(count: number, i: number) {
  if (count === 1) return LAYER_Y_START + LAYER_Y_SPAN / 2
  const gap = LAYER_Y_SPAN / (count - 1)
  return LAYER_Y_START + gap * i
}

export default async function Home() {
  const weeks = await getWeeks()

  const nodes: { x: number; y: number; layer: number }[] = []
  LAYER_X.forEach((x, layer) => {
    const count = LAYER_NODES[layer]
    for (let i = 0; i < count; i++) {
      nodes.push({ x, y: nodeY(count, i), layer })
    }
  })

  const edges: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (let layer = 0; layer < LAYER_X.length - 1; layer++) {
    const from = nodes.filter((n) => n.layer === layer)
    const to = nodes.filter((n) => n.layer === layer + 1)
    from.forEach((a) => {
      to.forEach((b) => {
        edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
      })
    })
  }

  return (
    <main className="max-w-3xl mx-auto px-8 py-12">
      <div className="relative border border-line rounded-lg overflow-hidden mb-12 bg-white">
        <svg
          viewBox="0 0 800 280"
          className="w-full h-56 md:h-64"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <rect width="800" height="280" fill="var(--color-paper)" />

          <g stroke="var(--color-line)" strokeWidth="1" opacity="0.6">
            {edges.map((e, i) => (
              <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
            ))}
          </g>

          {nodes.map((n, i) => {
            const isOutput = n.layer === LAYER_X.length - 1
            return (
              <circle
                key={i}
                cx={n.x}
                cy={n.y}
                r={isOutput ? 7 : 5}
                fill={isOutput ? 'var(--color-ochre)' : 'var(--color-paper)'}
                stroke="var(--color-steel)"
                strokeWidth="1.8"
              />
            )
          })}

          <text x="55" y="270" fontSize="11" fill="var(--color-slate)" fontFamily="var(--font-sans)">
            Week 1
          </text>
          <text x="670" y="270" fontSize="11" fill="var(--color-ochre)" fontFamily="var(--font-sans)" fontWeight="600">
            Week 12
          </text>
        </svg>

        <div className="p-8 border-t border-line">
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