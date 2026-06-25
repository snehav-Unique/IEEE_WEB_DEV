import React from 'react'

/**
 * BookmarkButton — controlled component, no internal state.
 * Props:
 *   - isBookmarked: boolean
 *   - onToggle: () => void
 */
export default function BookmarkButton({ isBookmarked = false, onToggle }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle?.() }}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      className={`p-2 rounded-full border transition-all duration-200
        ${isBookmarked
          ? 'bg-accent/10 border-accent text-accent'
          : 'bg-panel border-border text-ink-dim hover:text-accent hover:border-accent'
        }`}
    >
      {isBookmarked ? (
        /* solid bookmark */
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
        </svg>
      ) : (
        /* outline bookmark */
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
        </svg>
      )}
    </button>
  )
}
