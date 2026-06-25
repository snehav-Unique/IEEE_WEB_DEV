import { useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import GridMotion from '../components/GridMotion'
import TextType from '../components/TextType'

/**
 * Picks 28 event titles from the loaded events for the GridMotion background.
 * Falls back to static strings if events haven't loaded yet.
 */
function buildGridItems(events) {
  const fallback = [
    'UI/UX Design Showcase', 'Machine Learning Sprint', 'Robotics Hackathon',
    'Open Mic Night', 'Career Fair 2026', 'Cybersecurity Workshop',
    'Cloud Computing Talk', 'Photography Walk', 'Finance 101',
    'Debate Championship', 'React & Next.js', 'Embedded Systems',
    'AR/VR Development', 'Networking Night', 'Data Structures',
    'Competitive Programming', 'Research Symposium', 'Cultural Fest',
    'IEEE Student Branch', 'Coding Club RVCE', 'Sports Council',
    'Drama Club Showcase', 'Astronomy Night', 'Music Society',
    'Literary Festival', 'Eco Warriors', 'Design Guild', 'Quizzing Club',
  ]

  if (!events || events.length === 0) return fallback

  // Pick a spread of titles that are short enough to read in a small card
  const titles = events
    .filter((e) => e.title && e.title.length < 42)
    .map((e) => e.title)

  // Deterministically shuffle via a simple seeded selection
  const selected = []
  const step = Math.floor(titles.length / 28)
  for (let i = 0; i < 28 && i * step < titles.length; i++) {
    selected.push(titles[i * step])
  }

  // Pad with fallback if we didn't get enough
  while (selected.length < 28) {
    selected.push(fallback[selected.length % fallback.length])
  }

  return selected.slice(0, 28)
}

export default function HomePage({ events, loading }) {
  const navigate = useNavigate()
  const gridItems = useMemo(() => buildGridItems(events), [events])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-obsidian">

      {/* ── GridMotion background ── */}
      <div className="absolute inset-0 z-0">
        <GridMotion
          items={gridItems}
          gradientColor="rgba(10,10,15,0.92)"
        />
      </div>

      {/* ── Overlay gradient so content is always legible ── */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 70% at 20% 50%, rgba(10,10,15,0.85) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 15% 50%, rgba(10,10,15,0.95) 0%, transparent 60%)
          `
        }}
      />

      {/* ── Navbar ── */}
      <header className="absolute top-0 inset-x-0 z-30 h-16 flex items-center justify-between px-8">
        <span className="font-display font-semibold text-ink tracking-tight text-base">
          RVCE<span className="text-accent"> Events</span>
        </span>
        <button
          onClick={() => navigate('/feed')}
          className="text-sm font-display font-medium text-ink-dim hover:text-ink transition-colors"
        >
          Browse All →
        </button>
      </header>

      {/* ── Main content: left-anchored circular welcome panel ── */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="ml-12 lg:ml-20 flex flex-col items-start">

          {/* Circular border ring — the signature element */}
          <div className="relative">
            {/* Outer glow ring */}
            <div
              className="absolute -inset-3 rounded-full opacity-20 blur-2xl pointer-events-none"
              style={{ background: 'radial-gradient(circle, #7c6af7 0%, transparent 70%)' }}
            />

            {/* The circle itself */}
            <div
              className="relative flex flex-col items-center justify-center text-center"
              style={{
                width: '380px',
                height: '380px',
                borderRadius: '50%',
                border: '1.5px solid rgba(124, 106, 247, 0.35)',
                background: `
                  radial-gradient(circle at center,
                    rgba(124, 106, 247, 0.06) 0%,
                    rgba(10, 10, 15, 0.7) 60%,
                    rgba(10, 10, 15, 0.85) 100%
                  )
                `,
                backdropFilter: 'blur(12px)',
                boxShadow: `
                  inset 0 0 40px rgba(124, 106, 247, 0.04),
                  0 0 60px rgba(124, 106, 247, 0.08)
                `,
              }}
            >
              {/* Subtle tick marks around the ring */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `
                    repeating-conic-gradient(
                      rgba(124, 106, 247, 0.18) 0deg,
                      rgba(124, 106, 247, 0.18) 1deg,
                      transparent 1deg,
                      transparent 30deg
                    )
                  `,
                  borderRadius: '50%',
                  mask: 'radial-gradient(circle, transparent 93%, black 93%)',
                  WebkitMask: 'radial-gradient(circle, transparent 93%, black 93%)',
                }}
              />

              {/* Inner content */}
              <div className="px-10 flex flex-col items-center gap-3">
                {/* Eyebrow */}
                <span className="font-mono text-xs text-muted tracking-widest uppercase">
                  {loading ? 'Loading events…' : `${(events?.length ?? 0).toLocaleString()} events`}
                </span>

                {/* TextType headline */}
                <div className="font-display font-semibold text-2xl leading-snug text-ink min-h-[4.5rem] flex items-center">
                  <TextType
                    text={[
                      "What's happening\nat RVCE?",
                      "Workshops.\nHackathons.\nCareer Fairs.",
                      "Find your next\nbig opportunity.",
                      "Events that move\nyou forward.",
                    ]}
                    typingSpeed={55}
                    deletingSpeed={28}
                    pauseDuration={2200}
                    showCursor
                    cursorCharacter="_"
                    cursorClassName="text-accent"
                    className="font-display font-semibold text-2xl leading-snug text-ink"
                  />
                </div>

                {/* Subline */}
                <p className="text-ink-dim text-xs leading-relaxed max-w-[220px]">
                  Discover clubs, competitions, guest talks and more — all in one place.
                </p>

                {/* CTA */}
                <button
                  onClick={() => navigate('/feed')}
                  className="mt-2 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-dim text-white text-sm font-display font-medium transition-all duration-200 glow-ring-strong hover:scale-105 active:scale-100"
                >
                  Explore Events
                </button>
              </div>
            </div>

            {/* Decorative arc label at top of circle */}
            <div
              className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-2"
            >
              <div className="h-px w-8 bg-accent/30" />
              <span className="font-mono text-[10px] text-muted tracking-widest uppercase whitespace-nowrap">
                Campus Events Hub
              </span>
              <div className="h-px w-8 bg-accent/30" />
            </div>
          </div>

          {/* Stat pills below the circle */}
          <div className="mt-8 flex items-center gap-3">
            {[
              { label: 'Clubs', value: '20+' },
              { label: 'Categories', value: '12' },
              { label: 'This semester', value: loading ? '—' : `${(events?.length ?? 0).toLocaleString()}` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center px-4 py-2 rounded-xl border border-border bg-panel/60 backdrop-blur-sm"
              >
                <span className="font-display font-semibold text-base text-accent-glow">{value}</span>
                <span className="font-mono text-[10px] text-muted uppercase tracking-wide">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom hint ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-40">
        <span className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">Scroll to explore</span>
        <div className="w-px h-6 bg-gradient-to-b from-ink-dim to-transparent" />
      </div>
    </div>
  )
}
