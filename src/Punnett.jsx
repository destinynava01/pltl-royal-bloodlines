// A Punnett square: one parent's gametes across the top, the other's down the side. The boxes stay empty while a team
// works it out (filling them in is the exercise) and are filled in the notes afterwards.

const combine = (a, b) => [a, b].sort((x, y) => (x.toUpperCase() === y.toUpperCase() ? (x < y ? -1 : 1) : x.toUpperCase() < y.toUpperCase() ? -1 : 1)).join('')

export default function Punnett({ top, left, filled = false, className = '' }) {
  if (!top || !left) return null
  return (
    <div className={className}>
      <div className="mx-auto grid max-w-[13rem] grid-cols-3 gap-1">
        <div />
        {top.map((g, i) => <div key={`t${i}`} className="flex h-9 items-center justify-center font-display text-xl font-bold text-accent">{g}</div>)}
        {left.map((g, r) => (
          <div key={`r${r}`} className="contents">
            <div className="flex h-11 items-center justify-center font-display text-xl font-bold text-accent">{g}</div>
            {top.map((t, c) => (
              <div key={c} className={`flex h-11 items-center justify-center rounded-md border border-line text-lg font-bold ${filled ? 'bg-panel text-ink' : 'border-dashed bg-card text-muted'}`}>
                {filled ? combine(g, t) : '?'}
              </div>
            ))}
          </div>
        ))}
      </div>
      {!filled && <p className="mt-1 text-center text-xs text-muted">Fill in the boxes on paper, then count.</p>}
    </div>
  )
}
