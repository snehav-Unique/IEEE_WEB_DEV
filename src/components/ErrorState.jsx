import React from 'react'

/**
 * ErrorState — shown on data fetch failure.
 * Props: error (Error | string)
 */
export default function ErrorState({ error }) {
  const msg = error instanceof Error ? error.message : String(error ?? 'Unknown error')
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="text-6xl select-none">⚠️</div>
      <h2 className="font-display font-semibold text-xl text-red-400">Failed to load events</h2>
      <p className="text-ink-dim text-sm max-w-sm">{msg}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-5 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
