// Change these to rebrand the game.
export const SITE_NAME = 'Royal Bloodlines'
export const SITE_TAGLINE = 'Pedigree Detective: trace the hidden trait through the royal family.'
export const HUB_URL = 'https://pltl-game-hub.vercel.app'

export const MIN_TEAMS = 1
export const MAX_TEAMS = 8
// Team colors (the same order the server uses)
export const TEAM_COLORS = ['#22d3ee', '#f472b6', '#a3e635', '#fbbf24', '#a78bfa', '#fb923c', '#34d399', '#60a5fa']
export const DURATIONS = [null, 20, 30, 45] // minutes (null: no clock)

// The rounds, in play order (the same ids the server uses)
export const ROUNDS = [
  { id: 'crosses', title: 'Royal crosses', emoji: '👑', what: 'Punnett squares, ratios and a testcross', steps: 3 },
  { id: 'bloodline', title: 'Read the bloodline', emoji: '🔍', what: 'Name the pattern: autosomal or X-linked, dominant or recessive, or mitochondrial', steps: 3 },
  { id: 'carriers', title: 'Who carries it?', emoji: '🧬', what: 'Genotypes of marked family members, carriers included', steps: 3 },
  { id: 'odds', title: "The heir's odds", emoji: '🍼', what: 'Genetic counseling: the product and sum rules, sons vs daughters', steps: 3 },
  { id: 'beyond', title: 'Beyond Mendel', emoji: '🌹', what: 'Incomplete dominance, ABO blood types and a dihybrid cross', steps: 3, optional: true },
]
export const roundOf = (id) => ROUNDS.find((r) => r.id === id)

// mm:ss left on the clock
export function clockText(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// Answers as one line of text (the peek's list of tries). cur is the step the phones see.
export function describeAnswer(cur, a = {}) {
  if (!cur) return ''
  if (cur.kind === 'number') return String(a.number ?? '')
  return (cur.fields ?? []).map((f) => `${cur.fields.length > 1 ? `${f.label}: ` : ''}${f.choices.find((c) => c.id === a.picks?.[f.key])?.text ?? '?'}`).join(' · ')
}

// Leader scenarios (the /scenarios and /review pages): this game's id, and the pages' background
export const SCENARIO_GAME = 'bloodlines'
export const PAGE_BG = 'lab-bg'
