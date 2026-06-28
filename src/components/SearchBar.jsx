import React from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

export default function SearchBar({
  value,
  onChange,
  suggestions = [],
  onSuggestionClick,
  placeholder = 'Search workshops, hackathons, clubs...',
}) {
  const showDropdown = value.trim().length > 0 && suggestions.length > 0

  return (
    <div className="w-full">
      <div className="relative w-full">
        <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-accent/60 text-lg" />
        <input
          id="search-events"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="campus-search-input"
        />
        {value ? (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-border bg-white p-1.5 text-ink-dim transition hover:text-accent hover:bg-[#fff1f7]"
            aria-label="Clear search"
            type="button"
          >
            <FiX className="text-base" />
          </button>
        ) : null}

        {showDropdown ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-40 overflow-hidden rounded-3xl border border-border bg-white shadow-[0_18px_45px_rgba(232,111,164,0.14)]">
            <div className="border-b border-border px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                Suggestions
              </p>
              <p className="mt-1 text-xs text-ink-dim">
                Showing matches for your current search.
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.value}-${index}`}
                  type="button"
                  onClick={() => onSuggestionClick?.(suggestion.value)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fff4f8]"
                >
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-border bg-[#fff8fb] text-sm font-semibold text-accent-dim">
                    {suggestion.kind === 'event' ? 'E' : suggestion.kind === 'keyword' ? 'K' : '•'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">
                      {suggestion.label}
                    </span>
                    <span className="block truncate text-xs text-ink-dim">
                      {suggestion.kind === 'event'
                        ? `Event${suggestion.helper ? ` • ${suggestion.helper}` : ''}`
                        : suggestion.kind === 'keyword'
                          ? 'Suggested topic'
                          : suggestion.kind === 'interest'
                            ? 'Interest match'
                            : suggestion.kind}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
