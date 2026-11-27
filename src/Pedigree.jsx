// A royal family tree drawn like a textbook pedigree: squares are males, circles are females, shaded members have the
// trait. Couples are joined by a line, and their children hang from it. Each member is labeled by generation (I, II,
// III) and number, with a name underneath. Genotypes the team has worked out are written under the members (a dot
// marks a carrier), the members a question is about are ringed in gold, and the pattern is stamped on once found.
//   house: { name, trait: { name, desc }, people: [{ id, label, name, sex, gen, x, father, mother, spouse, affected }], seal, revealed: { id: text } }

const U = 46 // horizontal space per family member
const ROW = 92 // space between generations
const S = 22 // symbol size
const INK = '#3b2414'
const PAPER = '#f8efd9'
const SHADE = '#6b1d2f'

export default function Pedigree({ house, marks = [], names = true, className = '' }) {
  if (!house) return null
  const people = house.people
  const maxX = Math.max(...people.map((p) => p.x))
  const W = maxX * U + 90
  const top = house.seal ? 44 : 22
  const H = top + 2 * ROW + (names ? 58 : 40)
  const X = (p) => 48 + p.x * U
  const Y = (p) => top + 16 + (p.gen - 1) * ROW
  const byId = (id) => people[id]
  const revealed = house.revealed ?? {}
  // Every couple with children: the mating line, a line down, and the sibship line over the children
  const couples = []
  for (const p of people) {
    if (p.spouse === null || p.spouse < p.id) continue
    const s = byId(p.spouse)
    const [dad, mom] = p.sex === 'M' ? [p, s] : [s, p]
    const kids = people.filter((c) => c.father === dad.id && c.mother === mom.id)
    couples.push({ a: p, b: s, kids })
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`block w-full ${className}`} role="img" aria-label={`Family tree of ${house.name}`}>
      <rect width={W} height={H} rx="10" fill={PAPER} />
      {house.seal && (
        <g>
          <rect x={W / 2 - 120} y="8" width="240" height="24" rx="12" fill={SHADE} />
          <text x={W / 2} y="25" textAnchor="middle" fontSize="13" fontWeight="700" fill="#f8e7b0" fontFamily="Cinzel, serif">{house.seal}</text>
        </g>
      )}
      {/* couples and their children */}
      {couples.map(({ a, b, kids }, i) => {
        const y = Y(a)
        const midX = (X(a) + X(b)) / 2
        const sibY = y + ROW / 2
        return (
          <g key={i} stroke={INK} strokeWidth="1.6" fill="none">
            <line x1={Math.min(X(a), X(b)) + S / 2} y1={y} x2={Math.max(X(a), X(b)) - S / 2} y2={y} />
            {kids.length > 0 && (
              <>
                <line x1={midX} y1={y} x2={midX} y2={sibY} />
                <line x1={Math.min(midX, ...kids.map(X))} y1={sibY} x2={Math.max(midX, ...kids.map(X))} y2={sibY} />
                {kids.map((k) => <line key={k.id} x1={X(k)} y1={sibY} x2={X(k)} y2={Y(k) - S / 2} />)}
              </>
            )}
          </g>
        )
      })}
      {/* the members */}
      {people.map((p) => {
        const x = X(p), y = Y(p)
        const marked = marks.includes(p.id)
        const geno = revealed[p.id]
        const carrier = geno && !p.affected && /Aa|XᴬXᵃ/.test(geno)
        return (
          <g key={p.id}>
            {marked && <circle cx={x} cy={y} r={S * 0.82} fill="#f5c542" fillOpacity="0.45" stroke="#b8860b" strokeWidth="2.5" />}
            {p.sex === 'M'
              ? <rect x={x - S / 2} y={y - S / 2} width={S} height={S} fill={p.affected ? SHADE : '#fff'} stroke={INK} strokeWidth="1.8" />
              : <circle cx={x} cy={y} r={S / 2} fill={p.affected ? SHADE : '#fff'} stroke={INK} strokeWidth="1.8" />}
            {carrier && <circle cx={x} cy={y} r="3.6" fill={SHADE} />}
            <text x={x - S / 2 - 3} y={y - S / 2 - 1} textAnchor="end" fontSize="9.5" fontWeight="700" fill="#7a5c45" fontFamily="Inter, sans-serif">{p.label}</text>
            {names && <text x={x} y={y + S / 2 + 13} textAnchor="middle" fontSize="9.5" fill={INK} fontFamily="Inter, sans-serif">{p.name}</text>}
            {geno && (
              <text x={x} y={y + S / 2 + (names ? 26 : 13)} textAnchor="middle" fontSize="10.5" fontWeight="800" fill={SHADE} fontFamily="Inter, sans-serif">{geno}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// The key under a tree
export function PedigreeKey({ className = '' }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted ${className}`}>
      <span><span className="mr-1 inline-block h-3 w-3 border border-ink align-middle" /> male</span>
      <span><span className="mr-1 inline-block h-3 w-3 rounded-full border border-ink align-middle" /> female</span>
      <span><span className="mr-1 inline-block h-3 w-3 rounded-full border border-ink bg-[#6b1d2f] align-middle" /> has the trait</span>
      <span>members with no parents shown married into the family</span>
    </p>
  )
}
