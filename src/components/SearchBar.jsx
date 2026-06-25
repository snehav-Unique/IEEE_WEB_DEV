import React from 'react'

/**
 * SearchBar — styled search input.
 * Props: value (string), onChange (fn)
 */
export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-dim pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        id="search-events"
        type="text"
        placeholder="Search by title, description or location…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-panel text-ink
                   placeholder:text-ink-dim text-sm focus:outline-none focus:ring-2 focus:ring-accent
                   transition-shadow"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-dim hover:text-ink transition-colors"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  )
}
