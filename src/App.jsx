import { useEffect, useState } from 'react'
import { rbGame } from './api'
import Board from './Board'
import Pedigree from './Pedigree'
import { DEMO_HOUSE } from './demoHouse'
import Lobby from './Lobby'
import StudentJoin from './StudentJoin'
import { HUB_URL, SITE_NAME, SITE_TAGLINE } from './config'
import { readSession, saveSession } from './session'
import { isConfigured } from './supabase'
import { Button, CenterCard } from './ui'

// Routes:
//   /        leader: landing -> lobby -> board (the projector)
//   /join    student phone: join, get a team, house each applicant, answer when it's your turn to lead
// (No question bank: every team's run is generated, with its own order and numbers.)
function App() {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (!isConfigured) return <NotConfigured />
  if (path === '/join') return <StudentJoin />
  return <LeaderApp />
}

function LeaderApp() {
  const [saved] = useState(readSession) // a game this tab was running before the page loaded
  const [screen, setScreen] = useState(saved ? 'restoring' : 'landing') // restoring | landing | lobby | board
  const [session, setSession] = useState(null) // { gameId, hostToken, joinCode } once the game has started
  const [resume, setResume] = useState(null) // { session, teams, finalized } to rebuild the lobby
  const [lobbyNumber, setLobbyNumber] = useState(0)

  // After a refresh: ask the server for the game and put the leader back where they were
  useEffect(() => {
    if (!saved) return
    rbGame({ action: 'get_state', game_id: saved.gameId, host_token: saved.hostToken })
      .then((data) => {
        const names = (data.teams ?? []).map((t) => t.name)
        const restored = { ...saved, joinCode: data.game.join_code }
        setResume({ session: restored, teams: names, finalized: names.length > 0 })
        if (data.game.status !== 'setup') {
          setSession(restored)
          setScreen('board')
        } else {
          setScreen('lobby')
        }
      })
      .catch(() => {
        saveSession(null)
        setScreen('landing')
      })
  }, [saved])

  // Close the game: students' phones go back to the join page, and the leader starts fresh
  async function closeGame() {
    const current = session ?? resume?.session ?? readSession()
    if (current) {
      try {
        await rbGame({ action: 'close_game', game_id: current.gameId, host_token: current.hostToken })
      } catch {
        // Already gone
      }
    }
    saveSession(null)
    setSession(null)
    setResume(null)
    setLobbyNumber((n) => n + 1)
    setScreen('lobby')
  }

  if (screen === 'restoring') {
    return <CenterCard title={SITE_NAME}><p className="mt-4 text-muted">Restoring your game…</p></CenterCard>
  }

  if (screen === 'landing') {
    return (
      <main className="lab-bg flex min-h-dvh items-center justify-center p-4 text-ink">
        <div className="w-full max-w-lg text-center">
          <p className="text-4xl" aria-hidden="true">👑</p>
          <h1 className="gilded mt-1 text-5xl">{SITE_NAME}</h1>
          <p className="mt-2 font-display text-lg text-spike">{SITE_TAGLINE}</p>
          <div className="paper mt-6 overflow-hidden rounded-2xl p-2"><Pedigree house={DEMO_HOUSE} /></div>
          <div className="paper pinned mx-auto mt-8 rounded-2xl p-6">
          <p className="text-muted">
            Every team is a team of court genealogists with its own royal house and a hidden trait running through the
            family. Cross nobles with Punnett squares, read the family tree to name the pattern (autosomal or X-linked,
            dominant or recessive, or mitochondrial), find the carriers, and work out the heir&apos;s odds.
          </p>
          <Button className="mt-6" onClick={() => setScreen('lobby')}>📜 Open the archives</Button>
          <a href={HUB_URL} className="mt-4 block text-sm font-bold text-info hover:brightness-125">← All games</a>
          </div>
        </div>
      </main>
    )
  }

  // The lobby stays mounted (just hidden) so going back and forth keeps its state
  return (
    <>
      <div hidden={screen !== 'lobby'}>
        <Lobby
          key={lobbyNumber}
          resume={resume}
          hasGame={!!session}
          onOpenBoard={() => setScreen('board')}
          onCloseGame={closeGame}
          onStart={(started) => { setSession(started); setScreen('board') }}
        />
      </div>
      {session && screen === 'board' && (
        <Board session={session} onLobby={() => setScreen('lobby')} onNewGame={closeGame} />
      )}
    </>
  )
}

function NotConfigured() {
  return (
    <CenterCard title="Setup needed">
      <p className="mt-4 text-muted">
        Add your Supabase address and public key to <code>.env.local</code> (see <code>.env.example</code>), then restart.
      </p>
    </CenterCard>
  )
}

export default App
