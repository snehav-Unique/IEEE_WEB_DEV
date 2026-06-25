import React from 'react'

/**
 * EmptyState — shown when a list has no results.
 * Props: message (string), sub (string optional)
 */
export default function EmptyState({
  message = 'No events found',
  sub = 'Try adjusting your search or filters.',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="text-6xl select-none">🔍</div>
      <h2 className="font-display font-semibold text-xl text-ink">{message}</h2>
      <p className="text-ink-dim text-sm max-w-xs">{sub}</p>
    </div>
  )
}
