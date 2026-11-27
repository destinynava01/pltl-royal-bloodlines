import { useCallback, useEffect, useRef, useState } from 'react'
import { rbPlay, watchGame } from './api'
import Pedigree, { PedigreeKey } from './Pedigree'
import Punnett from './Punnett'
import { clockText, roundOf, SITE_NAME } from './config'
import { playClosed, playSolved, playWrong } from './sounds'
import { Button, CenterCard, Label, Paper, Stamp } from './ui'

const STORAGE_KEY = 'bloodlinesStudent'
const DEVICE_KEY = 'bloodlinesDevice'
const field = 'w-full rounded-lg border border-line bg-panel px-4 py-3 text-center text-xl font-bold text-ink outline-none focus:border-accent'

function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY)
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id) }
    return id
  } catch {
    return crypto.randomUUID()
  }
}
const readSaved = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null } }
const writeSaved = (v) => { try { v ? localStorage.setItem(STORAGE_KEY, JSON.stringify(v)) : localStorage.removeItem(STORAGE_KEY) } catch { /* blocked */ } }

// The phone: join, wait for a team, then work through the run. Everyone sees the applicant and can work it out on
// their own phone; the lead genealogist (it rotates every step) sends the team's answer.
export default function StudentJoin() {
  const [saved, setSaved] = useState(readSaved)
  const [notice, setNotice] = useState('')
  const leave = useCallback((message = '') => { writeSaved(null); setSaved(null); setNotice(message) }, [])
  return saved ? <Room saved={saved} onLeave={leave} /> : <JoinForm notice={notice} onJoined={(v) => { writeSaved(v); setSaved(v); setNotice('') }} />
}

function JoinForm({ onJoined, notice }) {
  const [code, setCode] = useState(() => (new URLSearchParams(window.location.search).get('code') ?? '').toUpperCase())
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function join(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const d = await rbPlay({ action: 'join', join_code: code, display_name: name, device_id: deviceId() })
      onJoined({ playerId: d.player.id, gameId: d.game.id })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <CenterCard title={SITE_NAME}>
      <p className="mt-2 text-muted">The royal archives are open. Ready to trace a bloodline?</p>
      <form onSubmit={join} className="mt-4 space-y-4">
        {notice && <p className="font-bold text-muted">{notice}</p>}
        <div>
          <Label>Game code</Label>
          <input className={`${field} mt-2 uppercase tracking-[0.4em]`} maxLength={6} placeholder="ABC123" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required autoCapitalize="characters" autoComplete="off" />
        </div>
        <div>
          <Label>Your name</Label>
          <input className={`${field} mt-2`} maxLength={40} placeholder="Maria G." value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <Button className="w-full" disabled={busy || code.length < 6 || !name.trim()}>{busy ? 'Joining…' : 'Join'}</Button>
        {error && <p className="font-bold text-bad">{error}</p>}
      </form>
    </CenterCard>
  )
}

function Room({ saved, onLeave }) {
  const [view, setView] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState(null) // { kind: 'right' | 'wrong' | 'closed' | 'info', text, at }
  const [now, setNow] = useState(() => Date.now())
  const lastEvent = useRef(null)
  const ownPlay = useRef(false)
  const stamp = useRef(0)
  const say = (kind, text) => { stamp.current += 1; setFlash({ kind, text, at: stamp.current }) }

  const check = useCallback(() => rbPlay({ action: 'status', player_id: saved.playerId, device_id: deviceId() })
    .then((d) => {
      if (d.ended) return onLeave('That game has ended. Join another with a new code.')
      // A teammate (the lead) answered: sounds for everyone, a note when it wasn't this phone
      const e = d.last_event
      if (e && lastEvent.current && e.at !== lastEvent.current) {
        if (e.kind === 'closed') playClosed()
        else if (e.kind === 'wrong') playWrong()
        else playSolved()
        if (!ownPlay.current && !e.mine) {
          if (e.kind === 'wrong') say('wrong', `🔍 ${e.by}'s answer didn't work. Look again together.`)
          else if (e.kind === 'closed') say('closed', '🎉 Case sealed!')
          else say('right', `✅ ${e.by} cracked it. On to the next clue!`)
        }
      }
      ownPlay.current = false
      lastEvent.current = e?.at ?? lastEvent.current ?? 'none'
      setView({ ...d, offset: Date.parse(d.server_now) - Date.now() })
      setError('')
    })
    .catch((err) => {
      if (/not found|another phone/i.test(err.message)) return onLeave('You were removed from that game.')
      setError(err.message)
    }), [saved, onLeave])

  useEffect(() => {
    check()
    return watchGame(saved.gameId, ['state', 'lobby'], check, 5000)
  }, [saved, check])
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id) }, [])

  async function send(action, answer) {
    setBusy(true)
    setError('')
    try {
      ownPlay.current = true
      const r = await rbPlay({ action, player_id: saved.playerId, device_id: deviceId(), step: view.case.step, answer })
      if (r.closed) say('closed', `🎉 ${r.feedback} Case sealed${r.rank ? ` (#${r.rank} to finish)` : ''}!`)
      else if (r.revealed) say('info', `📂 ${r.feedback}`)
      else if (r.correct) say('right', `✅ ${r.feedback} +${r.points}`)
      else say('wrong', `❌ ${r.feedback}${r.can_reveal ? ' (You can ask to see the answer now.)' : ''}`)
      await check()
    } catch (e) {
      ownPlay.current = false
      setError(e.message)
      check()
    } finally {
      setBusy(false)
    }
  }

  if (!view) return <CenterCard title={SITE_NAME}><p className="mt-4 text-muted">{error || 'Connecting…'}</p></CenterCard>
  const { player, teams } = view
  const myTeam = teams[player.team_index]
  const c = view.case
  const left = view.game.ends_at ? Date.parse(view.game.ends_at) - (now + view.offset) : null
  let body

  if (player.approval_status !== 'approved') body = <Note title="Almost in!" text="Your leader will put you on a team in a moment." />
  else if (view.game.status === 'setup') body = <Note title={`You're on ${myTeam?.name ?? 'a team'}`} text="The game starts soon. Grab some scratch paper for Punnett squares and the odds, and watch the projector." />
  else if (!c) body = <Note title="Opening the archives…" text="" />
  else if (view.game.status === 'finished' || c.finished) {
    body = (
      <>
        <Paper className="text-center">
          {c.finished ? <Stamp className="text-3xl">Case sealed</Stamp> : <p className="font-display text-2xl">Time&apos;s up!</p>}
          <p className="mt-4 font-display text-xl">{myTeam?.name}: {c.points} points</p>
          <p className="mt-1 text-muted">{c.solved.length} of {c.steps} steps{c.finish_rank ? ` · #${c.finish_rank} to finish` : ''}</p>
        </Paper>
        <MyHouse c={c} />
        <Notes c={c} />
      </>
    )
  } else {
    body = (
      <>
        <RoundProgress f={c.file} />
        <Task key={c.step} c={c} lead={view.lead} busy={busy} canReveal={view.can_reveal} onAnswer={(a) => send('answer', a)} onReveal={() => send('reveal')} />
        <MyHouse c={c} />
        <Notes c={c} />
      </>
    )
  }

  return (
    <main className="lab-bg min-h-dvh text-ink">
      <div className="mx-auto max-w-md space-y-4 p-4">
        <header className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card/90 px-3 py-2 shadow">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{player.display_name}</p>
            {myTeam && <p className="text-sm text-muted"><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: myTeam.color }} />{myTeam.name}</p>}
          </div>
          <div className="text-right">
            {left !== null && view.game.status === 'playing' && <p className={`font-display text-xl ${left < 120000 ? 'text-fire' : ''}`}>⏱ {clockText(left)}</p>}
            {c && <p className="font-display text-sm text-spike">{c.points} pts</p>}
          </div>
        </header>
        {flash && (
          <p key={flash.at} className={`pop rounded-xl px-4 py-3 font-semibold shadow ${flash.kind === 'wrong' ? 'shake bg-bad-soft text-bad' : flash.kind === 'info' ? 'bg-warn-soft text-warn' : 'bg-ok-soft text-ok'}`}>{flash.text}</p>
        )}
        {body}
        {error && <p className="rounded-lg bg-bad-soft px-3 py-2 text-center font-bold text-bad">{error}</p>}
        <p className="text-center"><button onClick={() => onLeave()} className="text-sm text-muted hover:text-ink">Leave game</button></p>
      </div>
    </main>
  )
}

function RoundProgress({ f }) {
  return (
    <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${f.rounds.length}, minmax(0, 1fr))` }}>
      {f.rounds.map((r) => {
        const meta = roundOf(r.id)
        const done = r.done === r.steps
        const now = f.current?.round === r.id
        return (
          <li key={r.id} className={`rounded-lg px-1 py-1.5 text-center text-xs font-bold shadow ${done ? 'bg-ok-soft text-ok' : now ? 'bg-accent-soft text-accent' : 'bg-card/70 text-muted'}`}>
            <span className="block text-lg">{done ? '✓' : meta.emoji}</span>{r.done}/{r.steps}
          </li>
        )
      })}
    </ol>
  )
}

const box = 'w-full min-w-0 rounded-lg border border-line bg-panel px-2 py-2 text-center text-lg font-bold text-ink outline-none focus:border-accent'
const chip = (on) => `rounded-lg border px-2 py-2 text-center font-bold transition ${on ? 'border-accent bg-accent-soft text-accent' : 'border-line bg-panel hover:bg-hover'}`
const filled = (v) => String(v ?? '').trim() !== ''

// The current step: the family tree (or Punnett square, or fact card), the question, the answer, and (for the lead)
// the send button
function Task({ c, lead, busy, canReveal, onAnswer, onReveal }) {
  const cur = c.file.current
  const [answer, setAnswer] = useState(() => (cur.kind === 'pick' ? { picks: {} } : { number: '' }))
  const isLead = lead?.me
  const round = roundOf(cur.round)
  const ready = cur.kind === 'number' ? filled(answer.number) : cur.fields.every((f) => answer.picks[f.key])
  return (
    <Paper>
      <Label>{round.emoji} {round.title} · step {c.step + 1} of {c.steps}</Label>
      <h2 className="mt-1 font-display text-2xl font-bold text-accent">{cur.title}</h2>
      {cur.house && (
        <div className="mt-3">
          <div className="overflow-hidden rounded-lg"><Pedigree house={cur.house} marks={cur.marks} /></div>
          <PedigreeKey className="mt-1" />
        </div>
      )}
      <p className="mt-3 font-semibold">{cur.prompt}</p>
      {cur.square && <Punnett top={cur.square.top} left={cur.square.left} className="mt-3" />}
      {cur.card && (
        <div className="mt-3 rounded-lg border border-line bg-panel px-3 py-2 text-sm">
          <p className="font-display font-bold text-accent">{cur.card.title}</p>
          <ul className="mt-1 grid grid-cols-2 gap-x-3">{cur.card.rows.map((row) => <li key={row}>{row}</li>)}</ul>
        </div>
      )}

      <div className="mt-4">
        {cur.kind === 'number' && (
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted">The chance (a fraction like 1/4, a decimal or a percent)</span>
            <input className={box} value={answer.number} placeholder="1/4" inputMode="text" autoComplete="off" spellCheck={false}
              onChange={(e) => setAnswer({ number: e.target.value })} />
          </label>
        )}
        {cur.kind === 'pick' && (
          <div className="space-y-3">
            {cur.fields.map((f) => (
              <fieldset key={f.key}>
                {cur.fields.length > 1 && <legend className="mb-1 text-sm font-bold text-muted">{f.label}</legend>}
                <div className={`grid gap-1.5 ${f.choices.length > 3 ? 'grid-cols-2' : ''}`}>
                  {f.choices.map((ch) => (
                    <button key={ch.id} type="button" onClick={() => setAnswer({ picks: { ...answer.picks, [f.key]: ch.id } })}
                      className={`${chip(answer.picks[f.key] === ch.id)} text-sm`}>{ch.text}</button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        )}
      </div>

      {isLead && <Button className="mt-4 w-full" disabled={busy || !ready} onClick={() => onAnswer(answer)}>{busy ? 'Checking…' : '📜 Present to the court'}</Button>}
      <div className="mt-4 rounded-lg bg-panel px-3 py-2 text-sm">
        {isLead
          ? <p className="font-bold text-accent">📜 You&apos;re the lead genealogist for this step. Talk it through with your team, then send the answer.</p>
          : <p>📜 <b>{lead?.name ?? 'Your teammate'}</b> is the lead genealogist for this step. Work it out here too and help out loud: only the lead&apos;s answer counts.</p>}
        {c.misses > 0 && <p className="mt-1 text-bad">{c.misses} wrong tr{c.misses === 1 ? 'y' : 'ies'} on this step (each costs a quarter of its points).</p>}
      </div>
      {isLead && canReveal && (
        <button type="button" disabled={busy} onClick={() => window.confirm('Show the answer? This step scores 0, but your team moves on.') && onReveal()} className="mt-3 w-full text-sm font-bold text-warn underline">
          Stuck? Show us the answer (0 points for this step)
        </button>
      )}
    </Paper>
  )
}

// The team's own royal house, as far as it has worked it out
function MyHouse({ c }) {
  const house = c.file.house
  if (!house) return null
  return (
    <Paper pinned={false} className="!p-3">
      <Label className="mb-2">Your royal house · {house.name}: {house.trait.name}</Label>
      <div className="overflow-hidden rounded-lg"><Pedigree house={house} /></div>
      <PedigreeKey className="mt-1" />
    </Paper>
  )
}

// Every solved step: the answer and why (a Punnett square comes back filled in)
function Notes({ c }) {
  const notes = c.file.notes
  if (!notes.length) return null
  return (
    <Paper pinned={false}>
      <Label>Your notes</Label>
      <ol className="mt-2 space-y-2 text-sm">
        {[...notes].reverse().map((n) => (
          <li key={n.step} className="rounded-lg bg-panel px-3 py-2">
            <p className="font-bold">{roundOf(n.round).emoji} {n.title}: <span className="text-accent">{n.answer}</span></p>
            <p className="mt-0.5 text-muted">{n.explain}</p>
            {n.square && <Punnett top={n.square.top} left={n.square.left} filled className="mt-2" />}
          </li>
        ))}
      </ol>
    </Paper>
  )
}

function Note({ title, text }) {
  return (
    <Paper className="text-center">
      <h2 className="font-display text-2xl font-bold text-accent">{title}</h2>
      {text && <p className="mt-2 text-muted">{text}</p>}
    </Paper>
  )
}
