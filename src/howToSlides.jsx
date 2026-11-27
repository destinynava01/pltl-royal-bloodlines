/* eslint-disable react-refresh/only-export-components -- static slide content with small local helpers */
// The "How to play" slides for Royal Bloodlines (shown before the game starts). The art uses the same pieces as the
// real game (the family tree, the Punnett square).
import Pedigree from './Pedigree'
import Punnett from './Punnett'
import { DEMO_HOUSE } from './demoHouse'

function Panel({ children, className = '' }) {
  return <div className={`paper w-full max-w-sm rounded-xl p-4 text-left text-sm text-ink ${className}`}>{children}</div>
}
const SOLVED = { ...DEMO_HOUSE, seal: 'X-linked recessive', revealed: { 1: 'XᴬXᵃ', 4: 'XᴬXᵃ', 2: 'XᵃY' } }

export const SLIDES = [
  {
    title: 'A hidden trait in the royal family',
    text: 'Every team is a team of court genealogists with its own royal house. A made-up trait runs through the family, and the shaded members have it. Squares are men, circles are women, and members with no parents drawn married into the family.',
    art: <Panel className="!max-w-lg !p-2"><Pedigree house={DEMO_HOUSE} /></Panel>,
  },
  {
    title: 'Crack the bloodline',
    text: 'Cross nobles with Punnett squares, then read family trees to name the pattern: autosomal dominant or recessive, X-linked dominant or recessive, or mitochondrial. Find out who carries it, and work out the heir\'s odds. Your team\'s tree fills in on the projector as you go.',
    art: <Panel className="!max-w-lg !p-2"><Pedigree house={SOLVED} marks={[4]} /></Panel>,
  },
  {
    title: 'One lead genealogist at a time',
    text: 'Everyone\'s phone shows the question, so everyone can work it out (bring paper for the Punnett squares). But one student is the lead genealogist and sends the team\'s answer. The role moves to the next teammate after every step, so talk it through first.',
    art: (
      <Panel>
        <p className="font-display text-lg font-bold text-accent">A royal match</p>
        <p className="mt-1 text-muted">Cc × Cc: what fraction of the children have straight hair?</p>
        <Punnett top={['C', 'c']} left={['C', 'c']} filled className="mt-2" />
      </Panel>
    ),
  },
  {
    title: 'The rounds',
    text: 'Royal crosses (Punnett squares and a testcross), Read the bloodline (the inheritance pattern), Who carries it? (genotypes and carriers), The heir\'s odds (the product and sum rules), and Beyond Mendel (incomplete dominance, blood types and a dihybrid cross; optional).',
    art: (
      <Panel>
        <ol className="space-y-1 text-base">
          <li>👑 <b>Royal crosses</b></li>
          <li>🔍 <b>Read the bloodline</b></li>
          <li>🧬 <b>Who carries it?</b></li>
          <li>🍼 <b>The heir&apos;s odds</b></li>
          <li>🌹 <b>Beyond Mendel</b> <span className="text-muted">(optional)</span></li>
        </ol>
      </Panel>
    ),
  },
  {
    title: 'Points',
    text: 'Each step is worth 50 points; every wrong try costs a quarter. Stuck after three tries? You can see the answer and move on, for 0 points. Every answer goes into your team\'s notes with the reason, so your phone ends up as a study sheet. Finish first for a bonus!',
    art: (
      <Panel>
        <p className="flex justify-between font-display text-lg font-bold"><span>🥇 Team 2</span><span className="text-spike">585</span></p>
        <p className="mt-1 flex justify-between font-display text-lg font-bold"><span>🥈 Team 1</span><span className="text-spike">540</span></p>
        <p className="mt-4 text-center"><span className="stamp text-xl">Case sealed</span></p>
      </Panel>
    ),
  },
]

// The guide's own look: a record book on velvet
export const SKIN = {
  backdrop: 'bg-[#0e050a]/85',
  panel: 'rounded-xl border border-line bg-card text-ink shadow-2xl',
  glow: true,
  label: 'font-display text-sm font-bold tracking-[0.15em]',
  skip: 'rounded-lg border border-line bg-panel px-3 py-1 text-sm font-bold text-muted hover:bg-hover',
  art: 'lab-bg rounded-xl',
  step: 'text-sm font-bold uppercase tracking-widest text-muted',
  title: 'font-display text-3xl font-bold leading-tight text-accent sm:text-4xl',
  text: 'text-lg leading-relaxed text-ink',
  footer: 'border-t border-line bg-panel',
  check: 'text-sm text-muted',
  back: 'rounded-lg border border-line bg-card px-4 py-2 font-display text-ink hover:bg-hover',
  next: 'rounded-lg bg-[linear-gradient(#f3cf78,#d29c32)] px-5 py-2 font-display text-lg font-bold text-on-accent hover:brightness-110',
  dotOff: '#5e3249',
  launcher: 'rounded-lg border border-line bg-card px-4 py-2 font-display text-sm font-bold text-accent shadow-lg hover:bg-hover',
}
