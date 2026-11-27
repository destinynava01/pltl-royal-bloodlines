// Shared building blocks with the royal-archives look: record-book panels on velvet, gold buttons, and a crimson
// "SEALED" stamp

export function CenterCard({ title, children }) {
  return (
    <main className="lab-bg flex min-h-dvh items-center justify-center p-4 text-ink">
      <div className="paper pinned w-full max-w-md rounded-2xl p-8 text-center">
        <h1 className="gilded text-4xl">{title}</h1>
        {children}
      </div>
    </main>
  )
}

export function Label({ children, className = '' }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.2em] text-muted ${className}`}>{children}</p>
}

const BUTTONS = {
  primary: 'bg-[linear-gradient(#f3cf78,#d29c32)] text-on-accent shadow-[0_0_18px_rgb(232_182_76/0.35)] hover:brightness-110',
  fire: 'bg-fire text-on-accent shadow-[0_0_18px_rgb(209_67_91/0.4)] hover:brightness-110',
  outline: 'border border-line bg-panel text-ink hover:bg-hover',
}

export function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`rounded-lg px-6 py-3 font-display text-lg font-bold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${BUTTONS[variant]} ${className}`}
      {...props}
    />
  )
}

// A record book
export function Paper({ children, className = '', pinned = true }) {
  return <section className={`paper rounded-2xl p-5 ${pinned ? 'pinned' : ''} ${className}`}>{children}</section>
}

// The crimson stamp ("SEALED", "DONE")
export function Stamp({ children, className = '' }) {
  return <span className={`stamp stamp-in ${className}`}>{children}</span>
}
